from django.db import models
from django.contrib.auth.models import User

'''
Model management permission: Allows creation, modification, and deletion of models
'''
''' 
Asset management permission: Allows creation, modification, decommissioning,
and deletion of assets. May be conferred globally or per-datacenter. Naturally, if a user
has a per-datacenter asset management permission, then they should only be able to
affect assets in that datacenter. When moving assets between datacenters, such users
should only be able to move assets among datacenters they have permission on.
'''
'''
Power permission: Allows power control of assets for users that are not the explicit
owners of the asset in question. Naturally, this only affects assets connected to networkenabled PDUs.
'''
'''
Audit permission: Allows reading of the audit log.
'''
'''
Administrator permission: Inherits all of the abilities described above. Can also
confer or revoke permissions onto users (per req 1.10).
'''


class Permissions(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    model_perm = models.BooleanField(name='Model Management', default=False)
    asset_perm = models.BooleanField(name='Asset Management', default=False)
    power_perm = models.BooleanField(name='Power Permission', default=False)
    audit_perm = models.BooleanField(name='Audit Permission', default=False)
    admin_perm = models.BooleanField(name='Admin Permission', default=False)
