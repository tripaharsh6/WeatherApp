from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    ProfileView,
    FavoriteCityListCreateView,
    FavoriteCityDetailView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('cities/', FavoriteCityListCreateView.as_view(), name='favorite-cities-list-create'),
    path('cities/<int:pk>/', FavoriteCityDetailView.as_view(), name='favorite-cities-detail'),
]
