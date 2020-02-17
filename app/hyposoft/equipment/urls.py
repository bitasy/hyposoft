from django.urls import path
from .views import *
from .generic_views import *

# Generic Views
import inspect
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
    path('ITModelFilter', ITModelFilterView.as_view()),
    path('AssetFilter', AssetFilterView.as_view())
]
