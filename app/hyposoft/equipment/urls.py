from django.urls import path
from .views import *
from .list_views import *

urlpatterns = [
    path('ITModelCreate', ITModelCreate.as_view()),
    path('AssetCreate', AssetCreate.as_view()),
    path('RackRangeCreate', RackRangeCreate.as_view()),
    path('DatacenterCreate', DatacenterCreate.as_view()),

    path('ITModelUpdate/<int:pk>', ITModelUpdate.as_view()),
    path('AssetUpdate/<int:pk>', AssetUpdate.as_view()),
    path('DatacenterUpdate/<int:pk>', DatacenterUpdate.as_view()),

    path('ITModelDestroy/<int:pk>', ITModelDestroy.as_view()),
    path('AssetDestroy/<int:pk>', AssetDestroy.as_view()),
    path('RackRangeDestroy', RackRangeDestroy.as_view()),
    path('DatacenterDestroy/<int:pk>', DatacenterDestroy.as_view()),

    path('ITModelRetrieve/<int:pk>', ITModelRetrieve.as_view()),
    path('AssetRetrieve/<int:pk>', AssetRetrieve.as_view()),
    path('AssetDetailRetrieve/<int:pk>', AssetDetailRetrieve.as_view()),

    path('ITModelList', ITModelList.as_view()),
    path('ITModelPickList', ITModelPickList.as_view()),
    path('AssetList', AssetList.as_view()),
    path('AssetPickList', AssetPickList.as_view()),
    path('DecommissionedAssetList', DecommissionedAssetList.as_view()),

    path('DecommissionAsset/<int:asset_id>', DecommissionAsset.as_view())
]
