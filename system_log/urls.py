from django.urls import path
from .views import LogView

urlpatterns = [
    path('LogView', LogView.as_view())
]
