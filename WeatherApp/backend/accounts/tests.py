from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import UserProfile, FavoriteCity

class AccountsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/register/'
        self.login_url = '/api/login/'
        self.profile_url = '/api/profile/'
        self.cities_url = '/api/cities/'

    def test_register_success(self):
        payload = {
            'username': 'rahul_sharma',
            'email': 'rahul@example.com',
            'password': 'password123'
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertTrue(User.objects.filter(username='rahul_sharma').exists())
        # Profile should be auto-created
        user = User.objects.get(username='rahul_sharma')
        self.assertTrue(hasattr(user, 'profile'))
        self.assertEqual(user.profile.default_city, 'Delhi')

    def test_register_duplicate_username(self):
        User.objects.create_user(username='existing_user', password='password123')
        payload = {
            'username': 'existing_user',
            'email': 'new@example.com',
            'password': 'password123'
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_valid_credentials(self):
        User.objects.create_user(username='test_user', password='mypassword')
        payload = {
            'username': 'test_user',
            'password': 'mypassword'
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])

    def test_login_invalid_password(self):
        User.objects.create_user(username='test_user', password='mypassword')
        payload = {
            'username': 'test_user',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_profile_access(self):
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_profile_preferences(self):
        user = User.objects.create_user(username='pref_user', password='password123')
        self.client.force_authenticate(user=user)

        # Update units to imperial and theme to dark
        update_data = {
            'units': 'imperial',
            'theme': 'dark',
            'default_city': 'Mumbai'
        }
        response = self.client.put(self.profile_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.profile.refresh_from_db()
        self.assertEqual(user.profile.units, 'imperial')
        self.assertEqual(user.profile.theme, 'dark')
        self.assertEqual(user.profile.default_city, 'Mumbai')

    def test_add_and_remove_favorite_city(self):
        user = User.objects.create_user(username='fav_user', password='password123')
        self.client.force_authenticate(user=user)

        # Add Mumbai
        payload = {
            'name': 'Mumbai',
            'lat': 19.0760,
            'lon': 72.8777
        }
        response = self.client.post(self.cities_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        city_id = response.data['id']

        # Add duplicate Mumbai -> should fail
        dup_response = self.client.post(self.cities_url, payload, format='json')
        self.assertEqual(dup_response.status_code, status.HTTP_400_BAD_REQUEST)

        # Remove city
        delete_url = f"{self.cities_url}{city_id}/"
        del_response = self.client.delete(delete_url)
        self.assertEqual(del_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(FavoriteCity.objects.filter(user=user).count(), 0)
