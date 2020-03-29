"""hyposoft URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from .users import UserList
from django.conf.urls import url

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


urlpatterns += [
    path('', include('frontend.urls')),
    path('auth/', include('hypo_auth.urls')),
    path('admin/', admin.site.urls),
    path('api/equipment/', include('equipment.urls')),
    path('api/network/', include('network.urls')),
    path('api/power/', include('power.urls')),
    path('api/changeplan/', include('changeplan.urls')),
    path('api/log/', include('system_log.urls')),
    path('api/import/', include('bulk.import_urls')),
    path('api/export/', include('bulk.export_urls')),
    path('api/users/UserList/', UserList.as_view()),
    path('api/auth/', include('rest_framework.urls')),
]
