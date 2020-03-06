from django.contrib.auth.signals import user_logged_in
from django.contrib.auth.models import User
from .models import ChangePlan


@user_logged_in()
def create_live(*args, **kwargs):
    if not ChangePlan.objects.filter(name="live").exists():
        ChangePlan.objects.create(id=0, owner=User.objects.filter(username="admin").first(), name="live")
