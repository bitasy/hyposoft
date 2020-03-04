from django.urls import path
from .views import *

# Generic Views
from . import generic_views
views = [(name[:-4], cls) for name, cls in generic_views.__dict__.items() if isinstance(cls, type) and name[-4:] == "View"]

urlpatterns = []

for view in views:
    url = view[0]
    obj = view[1].as_view()
    if url.endswith(('Retrieve', 'Update', 'Destroy')):
        url += '/<int:pk>'
    urlpatterns.append(
        path(url, obj)
    )

# Custom Views
urlpatterns += [
    path('AllNetworkPorts/<int:datacenter_id>', AllNetworkPorts.as_view()),
    path('FreeNetworkPorts/<int:datacenter_id>', FreeNetworkPorts.as_view()),
    path('NetworkPortDeleteByAsset/<int:asset_id>', NetworkPortDeleteByAsset.as_view()),
    path('NetworkGraph/<int:asset_id>', net_graph)
]