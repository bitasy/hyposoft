from django.urls import path
from .new_views import *

urlpatterns = [
    path('ITModelCreate', ITModelCreate.as_view()),
    path('AssetCreate', AssetCreate.as_view()),
    path('RackRangeCreate', RackRangeCreate.as_view()),
    path('ITModelUpdate/<int:pk>', ITModelUpdate.as_view()),
    path('AssetUpdate/<int:pk>', AssetUpdate.as_view()),
    path('DatacenterCreate', DatacenterCreate.as_view())
]
