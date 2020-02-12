from django.urls import path
from .views import *
from .generic_views import *

# Generic Views
urlpatterns = [
    path('ITModelCreate', ITModelCreateView.as_view()),
    path('ITModelRetrieve/<int:pk>', ITModelRetrieveView.as_view()),
    path('ITModelUpdate/<int:pk>', ITModelUpdateView.as_view()),
    path('ITModelDestroy/<int:pk>', ITModelDestroyView.as_view()),
    path('ITModelList', ITModelListView.as_view()),
    path('AssetCreate', AssetCreateView.as_view()),
    path('AssetRetrieve/<int:pk>', AssetRetrieveView.as_view()),
    path('AssetUpdate/<int:pk>', AssetUpdateView.as_view()),
    path('AssetDestroy/<int:pk>', AssetDestroyView.as_view()),
    path('AssetList', AssetListView.as_view()),
    path('RackCreate', RackCreateView.as_view()),
    path('RackRetrieve/<int:pk>', RackRetrieveView.as_view()),
    path('RackUpdate/<int:pk>', RackUpdateView.as_view()),
    path('RackDestroy/<int:pk>', RackDestroyView.as_view()),
    path('RackList', RackListView.as_view()),
]

# Custom Views
urlpatterns += [
    path('ITModelFilter', ITModelFilterView.as_view()),
    path('AssetFilter', AssetFilterView.as_view())
]
