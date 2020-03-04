from django.contrib import admin
from .models import NetworkPortLabel, NetworkPort


admin.site.register(NetworkPortLabel)
admin.site.register(NetworkPort)