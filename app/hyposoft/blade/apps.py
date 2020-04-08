from django.apps import AppConfig


class BladeConfig(AppConfig):
    name = 'blade'

    def ready(self):
        from . import signals
