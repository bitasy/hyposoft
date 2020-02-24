from import_export.admin import ImportExportModelAdmin
from .resources import ITModelResource, AssetResource
from django.contrib import admin
from import_export.formats import base_formats
from .models import ITModel, Asset, Rack


class ITModelAdmin(ImportExportModelAdmin):
    resource_class = ITModelResource
    formats = (base_formats.CSV,)


admin.site.register(ITModel, ITModelAdmin)


class AssetAdmin(ImportExportModelAdmin):
    resource_class = AssetResource
    formats = (base_formats.CSV,)


admin.site.register(Asset, AssetAdmin)

admin.site.register(Rack)
