from import_export.admin import ImportExportModelAdmin
from .resources import ITModelResource, InstanceResource
from django.contrib import admin
from import_export.formats import base_formats
from .models import ITModel, Instance, Rack


class ITModelAdmin(ImportExportModelAdmin):
    resource_class = ITModelResource
    formats = (base_formats.CSV,)


admin.site.register(ITModel, ITModelAdmin)


class InstanceAdmin(ImportExportModelAdmin):
    resource_class = InstanceResource
    formats = (base_formats.CSV,)


admin.site.register(Instance, InstanceAdmin)

admin.site.register(Rack)
