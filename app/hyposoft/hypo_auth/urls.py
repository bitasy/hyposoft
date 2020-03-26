from django.urls import path
from . import views
from .views import ShibbolethView, ShibbolethLoginView

urlpatterns = [
    path('current_user', views.SessionView.as_view()),
    path('login', views.LoginView.as_view()),
    path('logout', views.LogoutView.as_view()),
    path('shib_login', ShibbolethLoginView.as_view()),
    path('shib_session', ShibbolethView.as_view()),
]
