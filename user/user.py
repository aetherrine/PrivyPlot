from django.http import JsonResponse

from movie.models import Rating


def get_user_ratings(request):
    user_id = request.GET.get('user_id')
    if not user_id:
        return JsonResponse({'error': 'User ID is required.'}, status=400)

    user_ratings = Rating.objects.filter(user_id=int(user_id)).values('rating')
    ratings_list = [r['rating'] for r in user_ratings]

    return JsonResponse({'ratings': ratings_list}, safe=False)