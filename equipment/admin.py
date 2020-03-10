from import_export.admin import ImportExportActionModelAdmin
from .resources import ITModelResource, AssetResource
from django.contrib import admin
from import_export.formats import base_formats
from .models import ITModel, Asset, Rack, Datacenter


class ITModelAdmin(ImportExportActionModelAdmin):
    resource_class = ITModelResource
    formats = (base_formats.CSV,)
    list_filter = ['vendor', 'model_number']


class AssetAdmin(ImportExportActionModelAdmin):
    resource_class = AssetResource
    formats = (base_formats.CSV,)
    list_filter = ['hostname', 'itmodel', 'rack']


admin.site.register(ITModel, ITModelAdmin)
admin.site.register(Asset, AssetAdmin)
admin.site.register(Rack)
admin.site.register(Datacenter)
