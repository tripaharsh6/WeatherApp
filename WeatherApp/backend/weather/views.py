from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from accounts.models import UserProfile, FavoriteCity
from .services import fetch_weather_data, geocode_city

class WeatherView(APIView):
    """
    GET /api/weather/?lat=..&lon=.. or ?city=..
    Returns current weather of the default city or specified coordinates.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon')
        city_name = request.query_params.get('city')

        # Get user's preferred units
        try:
            profile = request.user.profile
            units = request.query_params.get('units', profile.units)
            default_city = profile.default_city
        except Exception:
            units = request.query_params.get('units', 'metric')
            default_city = 'Delhi'

        # Resolve location
        target_city = city_name or default_city
        if not lat or not lon:
            # Geocode the city
            geo_results = geocode_city(target_city)
            if geo_results and len(geo_results) > 0:
                first = geo_results[0]
                lat = first['lat']
                lon = first['lon']
                resolved_city = first['name']
            else:
                # Default fallback coordinates (Delhi)
                lat = 28.6139
                lon = 77.2090
                resolved_city = target_city or 'Delhi'
        else:
            try:
                lat = float(lat)
                lon = float(lon)
            except ValueError:
                return Response({'error': 'Invalid lat or lon coordinates.'}, status=status.HTTP_400_BAD_REQUEST)
            resolved_city = target_city or 'Current Location'

        weather = fetch_weather_data(lat, lon, units=units)
        return Response({
            'city': resolved_city,
            'lat': lat,
            'lon': lon,
            'units': units,
            **weather
        }, status=status.HTTP_200_OK)


class ForecastView(APIView):
    """
    GET /api/forecast/?lat=..&lon=.. or ?city=..
    Returns detailed forecast including hourly strip and 5-day daily forecast.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon')
        city_name = request.query_params.get('city')

        try:
            profile = request.user.profile
            units = request.query_params.get('units', profile.units)
            default_city = profile.default_city
        except Exception:
            units = request.query_params.get('units', 'metric')
            default_city = 'Delhi'

        target_city = city_name or default_city
        if not lat or not lon:
            geo_results = geocode_city(target_city)
            if geo_results and len(geo_results) > 0:
                first = geo_results[0]
                lat = first['lat']
                lon = first['lon']
                resolved_city = first['name']
            else:
                lat = 28.6139
                lon = 77.2090
                resolved_city = target_city or 'Delhi'
        else:
            try:
                lat = float(lat)
                lon = float(lon)
            except ValueError:
                return Response({'error': 'Invalid lat or lon coordinates.'}, status=status.HTTP_400_BAD_REQUEST)
            resolved_city = target_city or 'Current Location'

        weather_data = fetch_weather_data(lat, lon, units=units)
        return Response({
            'city': resolved_city,
            'lat': lat,
            'lon': lon,
            'units': units,
            **weather_data
        }, status=status.HTTP_200_OK)


class CitySearchView(APIView):
    """
    GET /api/search/?q={query}
    Returns geocoding results for city search.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response([], status=status.HTTP_200_OK)

        results = geocode_city(query)
        return Response(results, status=status.HTTP_200_OK)


class FavoritesWeatherSummaryView(APIView):
    """
    GET /api/weather/favorites/
    Returns each favorite city with its live weather and temperature
    specifically tailored for Home Screen's 'Favorite cities' list.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.profile
            units = profile.units
        except Exception:
            units = 'metric'

        favorites = FavoriteCity.objects.filter(user=request.user)
        results = []
        for fav in favorites:
            w = fetch_weather_data(fav.lat, fav.lon, units=units)
            results.append({
                'id': fav.id,
                'name': fav.name,
                'lat': fav.lat,
                'lon': fav.lon,
                'temperature': w.get('temperature'),
                'temperature_unit': w.get('temperature_unit', '°C'),
                'condition': w.get('condition', 'Clear'),
                'condition_code': w.get('condition_code', 0),
            })
        return Response(results, status=status.HTTP_200_OK)
