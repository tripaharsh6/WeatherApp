from django.urls import path
from .views import (
    WeatherView,
    ForecastView,
    CitySearchView,
    FavoritesWeatherSummaryView,
)

urlpatterns = [
    path('weather/', WeatherView.as_view(), name='weather-current'),
    path('weather/favorites/', FavoritesWeatherSummaryView.as_view(), name='weather-favorites-summary'),
    path('forecast/', ForecastView.as_view(), name='weather-forecast'),
    path('search/', CitySearchView.as_view(), name='city-search'),
]
