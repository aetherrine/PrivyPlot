from django.urls import path

from . import movie

urlpatterns = [
    path("load/", movie.load_csv_data, name="load csv data"),
    path("<int:movie_id>/rate/", movie.handle_rate, name="rate a movie"),
    path("evaluate/mid/<int:max_movie_id>/", movie.handle_evaluate_by_movie),
    path("evaluate/uid/<int:max_user_id>/", movie.handle_evaluate_by_user),
    path("<int:id>/", movie.get_movie, name="get movie details"),
    path("get_rating_distribution/<int:movie_id>/", movie.get_movie_rating_dist, name="get movie rating distribution"),
    # Get noise pie chart for all noised ratings
    path("generate_noise_pie_diagram/", movie.get_noise_pie_chart_for_movie),
    # Get noise pie chart for noised ratings of a single movie
    path("generate_noise_pie_diagram/<int:movie_id>/", movie.get_noise_pie_chart_for_movie),
    path("generate_noise_trend_diagram/<int:movie_id>/", movie.get_avg_noise_trend_line_chart_for_movie),
    path("generate_avg_noises_diagram_all_movies/", movie.get_avg_noise_scatter_chart_for_all_movies),
    path("generate_avg_noises_diagram_all_users/", movie.get_avg_noise_scatter_chart_for_all_users),
    path("generate_variance_diagram_all_movies/", movie.get_variance_scatter_chart_all_movies),
]

