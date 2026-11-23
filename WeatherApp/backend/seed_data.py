import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'weather_project.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import UserProfile, FavoriteCity

def seed():
    username = 'rahul_sharma'
    email = 'rahul@example.com'
    password = 'password123'

    user, created = User.objects.get_or_create(username=username, defaults={'email': email})
    if created:
        user.set_password(password)
        user.save()
        print(f"Created user: {username}")
    else:
        user.email = email
        user.set_password(password)
        user.save()
        print(f"Updated user: {username}")

    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.default_city = 'Delhi'
    profile.units = 'metric'
    profile.theme = 'light'
    profile.save()
    print(f"Updated profile for: {username} (Default City: Delhi, Units: metric)")

    # Favorite cities from mockups
    favorites = [
        {'name': 'Mumbai', 'lat': 19.0760, 'lon': 72.8777},
        {'name': 'Chandigarh', 'lat': 30.7333, 'lon': 76.7794},
    ]

    for fav in favorites:
        city_obj, fav_created = FavoriteCity.objects.get_or_create(
            user=user,
            name=fav['name'],
            defaults={'lat': fav['lat'], 'lon': fav['lon']}
        )
        if fav_created:
            print(f"Added favorite city: {fav['name']}")
        else:
            city_obj.lat = fav['lat']
            city_obj.lon = fav['lon']
            city_obj.save()
            print(f"City {fav['name']} already in favorites.")

    print("\nSeeding completed successfully!")

if __name__ == '__main__':
    seed()
