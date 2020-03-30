from django.contrib.auth.signals import user_logged_in
from django.contrib.auth.models import User
from django.dispatch import receiver

from .models import ChangePlan


@receiver(user_logged_in)
def create_live(*args, **kwargs):
    if not ChangePlan.objects.filter(id=0).exists():
        ChangePlan.objects.create(id=0, owner=User.objects.filter(username="admin").first(), name="live")