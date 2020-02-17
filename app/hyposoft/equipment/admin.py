<<<<<<< HEAD
from import_export.admin import ImportExportActionModelAdmin
from .resources import ITModelResource, InstanceResource
=======
from import_export.admin import ImportExportModelAdmin
from .resources import ITModelResource, AssetResource
>>>>>>> 3e4edaf484bc0216dabcadf5c2dd553cbd56371e
from django.contrib import admin
from import_export.formats import base_formats
from .models import ITModel, Asset, Rack


class ITModelAdmin(ImportExportActionModelAdmin):
    resource_class = ITModelResource
    formats = (base_formats.CSV,)
    list_filter = ['vendor', 'model_number']


admin.site.register(ITModel, ITModelAdmin)


<<<<<<< HEAD
class InstanceAdmin(ImportExportActionModelAdmin):
    resource_class = InstanceResource
=======
class AssetAdmin(ImportExportModelAdmin):
    resource_class = AssetResource
>>>>>>> 3e4edaf484bc0216dabcadf5c2dd553cbd56371e
    formats = (base_formats.CSV,)
    list_filter = ['hostname', 'itmodel', 'rack']


admin.site.register(Asset, AssetAdmin)

admin.site.register(Rack)
