from django.urls import path
from .views import ITModelCreateView, ITModelRetrieveView, ITModelUpdateView, ITModelDestroyView, ITModelListView, \
                   InstanceCreateView, InstanceRetrieveView, InstanceUpdateView, InstanceDestroyView, InstanceListView, \
                   RackCreateView, RackRetrieveView, RackUpdateView, RackDestroyView, RackListView

urlpatterns = [
    path('api/equipment/ITModelCreate', ITModelCreateView.as_view()),
    path('api/equipment/ITModelRetrieve', ITModelRetrieveView.as_view()),
    path('api/equipment/ITModelUpdate', ITModelUpdateView.as_view()),
    path('api/equipment/ITModelDestroy', ITModelDestroyView.as_view()),
    path('api/equipment/ITModelList', ITModelListView.as_view()),
    path('api/equipment/InstanceCreate', InstanceCreateView.as_view()),
    path('api/equipment/InstanceRetrieve', InstanceRetrieveView.as_view()),
    path('api/equipment/InstanceUpdate', InstanceUpdateView.as_view
    path('api/equipment/InstanceDestroy', InstanceDestroyView.as_view()),
    path('api/equipment/InstanceList', InstanceListView.as_view()),
    path('api/equipment/RackCreate', RackCreateView.as_view()),
    path('api/equipment/RackRetrieve', RackRetrieveView.as_view()),
    path('api/equipment/RackUpdate', RackUpdateView.as_view()),
    path('api/equipment/RackDestroy', RackDestroyView.as_view()),
    path('api/equipment/RackList', RackListView.as_view()),
]