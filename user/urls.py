from django.urls import path
from . import user

urlpatterns = [
    path('rating', user.get_user_ratings, name='get user ratings'),
]