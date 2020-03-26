from django.urls import path

from .list_views import PowerPortList

urlpatterns = [
    path('PowerPortList', PowerPortList.as_view())
]
