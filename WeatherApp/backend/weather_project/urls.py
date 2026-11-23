from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    # Accounts: /api/register/, /api/login/, /api/profile/, /api/cities/
    path('api/', include('accounts.urls')),
    # Weather: /api/weather/, /api/weather/favorites/, /api/forecast/, /api/search/
    path('api/', include('weather.urls')),
    # JWT Refresh endpoint (SRS Section 8)
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
