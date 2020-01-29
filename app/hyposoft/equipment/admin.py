from import_export.admin import ImportExportModelAdmin
from django.contrib import admin
from .models import ITModel, Instance


@admin.register(ITModel)
class ITModelAdmin(ImportExportModelAdmin):
    pass


@admin.register(Instance)
class InstanceAdmin(ImportExportModelAdmin):
    pass

