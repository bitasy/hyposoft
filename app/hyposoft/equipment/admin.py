from import_export.admin import ImportExportModelAdmin, ImportExportActionModelAdmin
from .resources import ITModelResource, InstanceResource
from django.contrib import admin
from import_export.formats import base_formats
from .models import ITModel, Instance, Rack


class ITModelAdmin(ImportExportActionModelAdmin):
    resource_class = ITModelResource
    formats = (base_formats.CSV,)
    list_filter = ['vendor', 'model_number']


admin.site.register(ITModel, ITModelAdmin)


class InstanceAdmin(ImportExportActionModelAdmin):
    resource_class = InstanceResource
    formats = (base_formats.CSV,)
    list_filter = ['hostname', 'itmodel', 'rack']


admin.site.register(Instance, InstanceAdmin)

admin.site.register(Rack)
