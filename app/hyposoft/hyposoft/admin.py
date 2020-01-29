from django.contrib import admin
from django.contrib.auth.models import Group

admin.site.unregister(Group)
admin.site.site_header = 'Hyposoft Administration'
admin.site.site_title = "Hyposoft Administration"
admin.site.index_title = "Hyposoft Administration"
