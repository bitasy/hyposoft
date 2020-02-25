from django.urls import path
from .views import LogView

urlpatterns = [
    path('', LogView.as_view())
]
