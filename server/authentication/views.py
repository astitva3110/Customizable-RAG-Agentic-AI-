from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializer import *
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status

from django.contrib.auth import get_user_model

User = get_user_model()

class LoginView(APIView):
    def post(self, request):
        try:
            serializer = LoginSerializer(data=request.data)
            if serializer.is_valid():
                email = serializer.validated_data["email"]
                password = serializer.validated_data["password"]

                try:
                    user = User.objects.get(email=email)
                    if not user.check_password(password):
                        return Response({"message": "Invalid email or password"}, status=401)
                except User.DoesNotExist:
                    return Response({"message": "Invalid email or password"}, status=401)

                refresh = RefreshToken.for_user(user)
                return Response(
                    {
                        "message": "Login Successful",
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                    },
                    status=200
                )

            return Response({"message": "Invalid data", "errors": serializer.errors}, status=400)

        except Exception as e:
            return Response({"message": str(e)}, status=500)



class RegisterView(APIView):
    def post(self, request):
        try:
            serializer = UserSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {"message": "User Registered Successfully"},
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(
                    {"message": "Invalid data", "errors": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

