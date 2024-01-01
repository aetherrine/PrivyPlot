from django.db import models


# Create your models here.
class Movie(models.Model):
    id = models.AutoField(primary_key=True)
    year = models.IntegerField()
    name = models.CharField(max_length=127)


class Rating(models.Model):
    id = models.AutoField(primary_key=True)
    movie_id = models.ForeignKey(
        "Movie",
        on_delete=models.CASCADE,
    )
    user_id = models.IntegerField()
    rating = models.IntegerField()
    noise = models.IntegerField(default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user_id', 'movie_id'], name='unique_user_movie_combination'
            )
        ]
