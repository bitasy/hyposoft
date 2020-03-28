from django.urls import path

from .list_views import NetworkPortList

urlpatterns = [
    path('NetworkPortList', NetworkPortList.as_view())
]
