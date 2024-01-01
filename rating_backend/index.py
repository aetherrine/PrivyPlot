from django.http import JsonResponse


def get_index_hello(request):
    return JsonResponse({"msg": "hello world"})
