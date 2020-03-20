from django.urls import path
from .new_views import *

urlpatterns = [
    path('ITModelCreate', ITModelCreate.as_view()),
    path('AssetCreate', AssetCreate.as_view()),
    path('RackRangeCreate', RackRangeCreate.as_view())
]
