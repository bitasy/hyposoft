from django.contrib import admin
from .models import NetworkPortLabel, NetworkPort
from .resources import NetworkPortResource
from import_export.admin import ImportExportActionModelAdmin
from import_export.formats import base_formats


class NetworkPortAdmin(ImportExportActionModelAdmin):
    resource_class = NetworkPortResource
    formats = (base_formats.CSV,)
    list_filter = ['asset', 'label']


admin.site.register(NetworkPortLabel, NetworkPortAdmin)
admin.site.register(NetworkPort)