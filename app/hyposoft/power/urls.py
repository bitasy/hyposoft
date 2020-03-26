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
    path('PoweredFilter', PoweredFilterView.as_view()),
    path('PDUNetwork/get/<rack>/<position>', getPDU),
    path('PDUNetwork/get/<int:asset_id>', get_asset),
    path('PDUNetwork/post', post_asset),
    path('PDUNetwork/cycle', cycle_asset),
    path('FreePowerPorts/<int:rack_id>/<int:asset_id>', freePowerPorts),
    path('PoweredDeleteByAsset/<int:asset_id>', poweredDeleteByAsset),
]
