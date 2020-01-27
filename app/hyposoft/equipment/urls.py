from django.urls import path
from .views import ITModelCreateView, ITModelRetrieveView, ITModelUpdateView, ITModelDestroyView, ITModelListView, \
                   InstanceCreateView, InstanceRetrieveView, InstanceUpdateView, InstanceDestroyView, InstanceListView, \
                   RackCreateView, RackRetrieveView, RackUpdateView, RackDestroyView, RackListView

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
