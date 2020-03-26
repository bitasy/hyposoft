from django.conf import settings
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from .models import Perms
from django.contrib.auth.models import User


@receiver(post_save, sender=settings.AUTH_USER_MODEL, dispatch_uid="token")
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.get_or_create(user=instance)


@receiver(post_save, sender=Perms)
def add_perms(sender, instance, *args, **kwargs):
    user = User.objects.get(username=instance.user)

    '''
    Allows creation, modification, and deletion of models
    '''
    if instance.model_perm or instance.admin_perm:
        user.has_perm('equipment.add_itmodel')
        user.has_perm('equipment.change_itmodel')
        user.has_perm('equipment.delete_itmodel')

    ''' 
    Asset management permission: Allows creation, modification, decommissioning,
    and deletion of assets. May be conferred globally or per-datacenter. Naturally, if a user
    has a per-datacenter asset management permission, then they should only be able to
    affect assets in that datacenter. When moving assets between datacenters, such users
    should only be able to move assets among datacenters they have permission on.
    '''
    if instance.asset_perm or instance.admin_perm:
        user.has_perm('equipment.add_asset')
        user.has_perm('equipment.change_asset')
        user.has_perm('equipment.delete_asset')

    '''
    Power permission: Allows power control of assets for users that are not the explicit
    owners of the asset in question. Naturally, this only affects assets connected to networkenabled PDUs.
    '''
    if instance.power_perm or instance.admin_perm:
        user.has_perm('power.add_powered')
        user.has_perm('power.change_powered')
        user.has_perm('power.delete_powered')

    '''
    Audit permission: Allows reading of the audit log.
    '''
    if instance.audit_perm or instance.admin_perm:
        user.has_perm('system_log.view_actionlog')

    '''
    Administrator permission: Inherits all of the abilities described above. Can also
    confer or revoke permissions onto users (per req 1.10).
    '''
    if instance.admin_perm:
        user.has_perm('hyposoft.add_Permissions')
        user.has_perm('hyposoft.change_Permissions')
        user.has_perm('hyposoft.delete_Permissions')
