from django.urls import path
from .views import ITModelCreateView, ITModelRetrieveView, ITModelUpdateView, ITModelDestroyView, ITModelListView, \
                   InstanceCreateView, InstanceRetrieveView, InstanceUpdateView, InstanceDestroyView, InstanceListView, \
                   RackCreateView, RackRetrieveView, RackUpdateView, RackDestroyView, RackListView

urlpatterns = [
    path('ITModelCreate', ITModelCreateView.as_view()),
    path('ITModelRetrieve', ITModelRetrieveView.as_view()),
    path('ITModelUpdate', ITModelUpdateView.as_view()),
    path('ITModelDestroy', ITModelDestroyView.as_view()),
    path('ITModelList', ITModelListView.as_view()),
    path('InstanceCreate', InstanceCreateView.as_view()),
    path('InstanceRetrieve', InstanceRetrieveView.as_view()),
    path('InstanceUpdate', InstanceUpdateView.as_view()),
    path('InstanceDestroy', InstanceDestroyView.as_view()),
    path('InstanceList', InstanceListView.as_view()),
    path('RackCreate', RackCreateView.as_view()),
    path('RackRetrieve', RackRetrieveView.as_view()),
    path('RackUpdate', RackUpdateView.as_view()),
    path('RackDestroy', RackDestroyView.as_view()),
    path('RackList', RackListView.as_view()),
]