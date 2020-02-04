from django.contrib import admin
from django.contrib.auth.models import User, Group
from rest_framework.authtoken.models import Token

admin.site.unregister(Group)
admin.site.unregister(Token)
admin.site.site_header = 'Hyposoft Administration'
admin.site.site_title = "Hyposoft Administration"
admin.site.index_title = "Hyposoft Administration"


class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'first_name', 'last_name', 'email')
    fields = ('username', 'first_name', 'last_name', 'email')


admin.site.unregister(User)
admin.site.register(User, UserAdmin)
