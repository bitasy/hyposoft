import logging

from django.http import JsonResponse, HttpResponse
from django.core import serializers
from django.contrib import auth
from rest_framework import views
from hyposoft.users import UserSerializer
from .serializers import LoginSerializer

class SessionView(views.APIView):
  def get(self, request):
    u = auth.get_user(request)
    if u.is_authenticated:
      user = UserSerializer(u.__dict__).data
      return JsonResponse(user)
    else:
      return HttpResponse()

class LoginView(views.APIView):
  def post(self, request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data['user']
    auth.login(request, user)
    return JsonResponse(UserSerializer(user).data)

class LogoutView(views.APIView):
  def post(self, request):
    auth.logout(request)
    return JsonResponse({})