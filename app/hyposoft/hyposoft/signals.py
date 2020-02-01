from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token


@receiver(post_save, sender=settings.AUTH_USER_MODEL, dispatch_uid="token")
def create_auth_token(sender, instance=None, created=False, **kwargs):
    print("test")
    if created:
        Token.objects.get_or_create(user=instance)
