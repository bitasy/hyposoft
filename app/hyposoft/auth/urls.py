from django.urls import path
from . import views

urlpatterns = [
    path('current_user', views.SessionView.as_view()),
    path('login', views.LoginView.as_view()),
    path('logout', views.LogoutView.as_view())
]