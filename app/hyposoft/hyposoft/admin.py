from django.contrib import admin
from django.contrib.auth.models import User, Group
from django.contrib.auth.admin import UserAdmin
from rest_framework.authtoken.models import Token

admin.site.unregister(Group)
admin.site.unregister(Token)
admin.site.site_header = 'Hyposoft Administration'
admin.site.site_title = "Hyposoft Administration"
admin.site.index_title = "Hyposoft Administration"


class MyUserAdmin(UserAdmin):
    list_display = ('username', 'first_name', 'last_name', 'email')
    list_filter = ()
    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),

        ('Personal info', {
            'fields': ('first_name', 'last_name', 'email')
        })
    )


admin.site.unregister(User)
admin.site.register(User, MyUserAdmin)
