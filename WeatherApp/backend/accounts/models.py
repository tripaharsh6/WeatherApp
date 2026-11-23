from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    UNIT_CHOICES = (
        ('metric', 'Celsius'),
        ('imperial', 'Fahrenheit'),
    )
    THEME_CHOICES = (
        ('light', 'Light'),
        ('dark', 'Dark'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    units = models.CharField(max_length=10, choices=UNIT_CHOICES, default='metric')
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default='light')
    default_city = models.CharField(max_length=100, default='Delhi')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile ({self.default_city}, {self.units}, {self.theme})"


class FavoriteCity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorite_cities')
    name = models.CharField(max_length=100)
    lat = models.FloatField()
    lon = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'name'], name='unique_user_favorite_city')
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.user.username})"
