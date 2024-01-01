import csv
import time
from pprint import pprint

from django.db.models import Avg
from django.http import HttpRequest
from django.test import TestCase

from rating_backend.settings import ARCHIVE_DATA_FOLDER
from . import movie

# Create your tests here.
from .models import Rating, Movie


class NoiseTestCase(TestCase):
    m = Movie(id=111111, year=2004, name="test movie")

    def setUp(self):
        self.m.save()
        r = Rating(movie_id=self.m, user_id=2134, rating=3)
        r.save()
        self.rating_id = r.id

    def test_add_noise(self):
        r = Rating(id=self.rating_id, movie_id=self.m, user_id=2134, rating=3)
        count = {}
        for i in range(0, 100):
            noise = movie.add_noise(r)
            if noise not in count:
                count[noise] = 0
            count[noise] = count[noise] + 1
        r.delete()
        print("noise distribution", dict(sorted(count.items())))


