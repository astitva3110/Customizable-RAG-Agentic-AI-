import jwt
from django.conf import settings
from django.http import JsonResponse

def jwt_required(view_func):
    def wrapper(request, *args, **kwargs):
        auth_header = request.META.get("HTTP_AUTHORIZATION")
        if not auth_header:
            return JsonResponse({"error": "Authorization header missing"}, status=401)

        try:
            prefix, token = auth_header.split(" ")
            if prefix.lower() != "bearer":
                return JsonResponse({"error": "Invalid token prefix"}, status=401)

            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            request.user_payload = payload
        except jwt.ExpiredSignatureError:
            return JsonResponse({"error": "Token expired"}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({"error": "Invalid token"}, status=401)

        return view_func(request, *args, **kwargs)
    return wrapper
