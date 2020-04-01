from django.apps import AppConfig


class EquipmentConfig(AppConfig):
    name = 'equipment'

    def ready(self):
        from . import signals
        from hypo_auth.models import set_datacenters
        #set_datacenters()
