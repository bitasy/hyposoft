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
    path('InstanceCreate', InstanceCreateView.as_view()),
    path('InstanceRetrieve/<int:pk>', InstanceRetrieveView.as_view()),
    path('InstanceUpdate/<int:pk>', InstanceUpdateView.as_view()),
    path('InstanceDestroy/<int:pk>', InstanceDestroyView.as_view()),
    path('InstanceList', InstanceListView.as_view()),
    path('RackCreate', RackCreateView.as_view()),
    path('RackRetrieve/<int:pk>', RackRetrieveView.as_view()),
    path('RackUpdate/<int:pk>', RackUpdateView.as_view()),
    path('RackDestroy/<int:pk>', RackDestroyView.as_view()),
    path('RackList', RackListView.as_view()),
]

# Custom Views
urlpatterns += [
    path('ITModelFilter', ITModelFilterList.as_view())
]
