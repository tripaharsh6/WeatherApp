from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from django.core.cache import cache
from weather.services import generate_weather_tip, format_temp, fetch_weather_data, geocode_city

class WeatherServicesAndAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='weather_tester', password='password123')
        self.client.force_authenticate(user=self.user)
        cache.clear()

    def test_weather_tip_generation(self):
        # Rain code (e.g. 61)
        rain_tip = generate_weather_tip(temp_c=25, weather_code=61)
        self.assertEqual(rain_tip, "Rain expected. Take an umbrella.")

        # Hot and dry tip (temp >= 30, low humidity)
        hot_tip = generate_weather_tip(temp_c=31, weather_code=2, humidity=48)
        self.assertEqual(hot_tip, "It is hot and dry. Carry water with you.")

        # Cold tip
        cold_tip = generate_weather_tip(temp_c=8, weather_code=0)
        self.assertIn("chilly", cold_tip)

    def test_format_temp(self):
        # 0 C -> 32 F
        self.assertEqual(format_temp(0, units='imperial'), 32)
        # 30 C -> 86 F
        self.assertEqual(format_temp(30, units='imperial'), 86)
        # 25.4 C -> 25 C
        self.assertEqual(format_temp(25.4, units='metric'), 25)

    def test_weather_endpoint_authenticated(self):
        response = self.client.get('/api/weather/?city=Delhi')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('temperature', response.data)
        self.assertIn('condition', response.data)
        self.assertIn('humidity', response.data)
        self.assertIn('wind', response.data)
        self.assertIn('tip', response.data)

    def test_forecast_endpoint(self):
        response = self.client.get('/api/forecast/?city=Mumbai')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('hourly', response.data)
        self.assertIn('daily', response.data)
        self.assertIn('metrics', response.data)
        self.assertIn('sunrise', response.data['metrics'])
        self.assertIn('sunset', response.data['metrics'])

    def test_search_endpoint(self):
        response = self.client.get('/api/search/?q=Chandigarh')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        if len(response.data) > 0:
            self.assertIn('name', response.data[0])
            self.assertIn('lat', response.data[0])
            self.assertIn('lon', response.data[0])

    def test_cache_hit_on_repeated_requests(self):
        # First request sets cache
        res1 = self.client.get('/api/weather/?lat=28.61&lon=77.20')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        # Second request hits cache
        res2 = self.client.get('/api/weather/?lat=28.61&lon=77.20')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertTrue(res2.data.get('cached', False))
