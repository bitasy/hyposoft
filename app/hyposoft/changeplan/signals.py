from django.contrib.auth.signals import user_logged_in
from django.contrib.auth.models import User
from django.dispatch import receiver

from hyposoft.utils import versioned_equal, versioned_object
from .models import ChangePlan, AssetDiff, NetworkPortDiff, PoweredDiff
from equipment.models import Asset, Rack
from power.models import Powered, PDU
from django.db.models.signals import pre_save


@receiver(user_logged_in)
def create_live(*args, **kwargs):
    if not ChangePlan.objects.filter(id=0).exists():
        ChangePlan.objects.create(id=0, owner=User.objects.filter(username="admin").first(), name="live")


@receiver(pre_save, sender=AssetDiff)
def assetdiff_message(sender, instance, *args, **kwargs):
    messages = []
    conflicts = []
    if instance.live_asset:
        if instance.changed_asset.asset_number != instance.live_asset.asset_number:
            messages.append('OLD ASSET NUMBER: ' + str(instance.live_asset.asset_number) + ' | ' +
                            'NEW ASSET NUMBER: ' + str(instance.changed_asset.asset_number))
        if instance.changed_asset.hostname != instance.live_asset.hostname:
            messages.append('OLD HOSTNAME: ' + str(instance.live_asset.hostname) + ' | ' +
                            'NEW HOSTNAME: ' + str(instance.changed_asset.hostname))
        if not versioned_equal(instance.changed_asset.rack, instance.live_asset.rack, Rack.IDENTITY_FIELDS):
            messages.append('OLD RACK: ' + str(instance.live_asset.rack.rack) + ' | ' + #todo test if new rack create in change plan breaks this
                            'NEW RACK: ' + str(instance.changed_asset.rack.rack))
        if instance.changed_asset.rack_position != instance.live_asset.rack_position:
            messages.append('OLD RACK POSITION: ' + str(instance.live_asset.rack_position) + ' | ' +
                            'NEW RACK POSITION: ' + str(instance.changed_asset.rack_position))
        if instance.changed_asset.itmodel != instance.live_asset.itmodel:
            messages.append('OLD ITMODEL: ' + str(instance.live_asset.itmodel) + ' | ' +
                            'NEW ITMODEL: ' + str(instance.changed_asset.itmodel))
        if instance.changed_asset.owner != instance.live_asset.owner:
            messages.append((('OLD OWNER: ' + str(instance.live_asset.owner.username))
                             if instance.live_asset.owner else 'None') + ' | ' +
                            ('NEW OWNER: ' + str(instance.changed_asset.owner.username)
                             if instance.changed_asset.owner else 'None'))
        if instance.live_asset.commissioned is None and instance.new_asset.commissioned is not None:
            conflicts.append({"field": "decommissioned",
                              "message": 'Live asset is decommissioned.'})

    else:
        changed = instance.changed_asset
        messages.append('CREATE ASSET: {} in {}U{}'.format(
            changed.hostname if changed.hostname else str(changed.itmodel),
            changed.rack.rack,
            changed.rack_position
        ))

    blocked = Asset.objects.filter(
        rack=instance.changed_asset.rack,
        rack_position__range=(instance.changed_asset.rack_position,
                              instance.changed_asset.rack_position + instance.changed_asset.itmodel.height),
        site=instance.changed_asset.site,
        version_id=0
    )
    if len(blocked) > 0:
        conflicts.append({"field": "rack_position",
                          "message": 'There is already an asset in this area of the specified rack.'})
    i = instance.changed_asset.rack_position - 1
    while i > 0:
        live_rack = versioned_object(instance.changed_asset.rack, ChangePlan.objects.get(id=0), Rack.IDENTITY_FIELDS)
        under = Asset.objects.filter(
            rack=live_rack,
            rack_position=i,
            site=instance.changed_asset.site,
            version_id=0
        )
        if len(under) > 0:
            asset = under.values_list(
                'rack_position', 'itmodel__height')[0]
            if asset[0] + asset[1] > instance.changed_asset.rack_position:
                conflicts.append({"field": "rack_position",
                                  "message": 'There is already an asset in this area of the specified rack.'})
        i -= 1
    instance.messages = messages
    instance.conflicts = conflicts


@receiver(pre_save, sender=NetworkPortDiff)
def networkportdiff_message(sender, instance, *args, **kwargs):
    messages = []
    conflicts = []
    if instance.live_networkport:
        if instance.changed_networkport.label != instance.live_networkport.label:
            messages.append('OLD LABEL: ' + str(instance.live_networkport.label.name) + ' | ' +
                            'NEW LABEL: ' + str(instance.changed_networkport.label.name))
        if instance.changed_networkport.mac_address != instance.live_networkport.mac_address:
            messages.append('OLD MAC ADDRESS: ' + str(instance.live_networkport.mac_address) + ' | ' +
                            'NEW MAC ADDRESS: ' + str(instance.changed_networkport.mac_address))
        if instance.changed_networkport.connection != instance.live_networkport.connection:
            messages.append('OLD CONNECTION: ' + (str(instance.live_networkport.connection.asset) + ' ' +
                                                  str(instance.live_networkport.connection.label.name)
                                                  if instance.live_networkport.connection else 'None') + ' | ' +
                            ('NEW CONNECTION: ' + str(instance.changed_networkport.connection.asset) + ' ' +
                             str(instance.changed_networkport.connection.label.name)
                             if instance.changed_networkport.connection else 'None'))

    else:
        messages.append('CREATE NETWORKPORT CONNECTION: {} – {} {}'.format(
            instance.changed_networkport.asset,
            instance.changed_networkport.label.name,
            instance.changed_networkport.mac_address or ""
        ) + (" TO {} – {}".format(
            instance.changed_networkport.connection.asset,
            instance.changed_networkport.connection.label.name) if instance.changed_networkport.connection else ''
        ))

    if instance.changed_networkport.connection:
        if instance.changed_networkport.connection and \
                instance.changed_networkport.asset == instance.changed_networkport.connection.asset:
            conflicts.append({"field": "network_port",
                              "message": 'Connections must be between different assets.'})
        if instance.changed_networkport.connection and \
                instance.changed_networkport.connection.asset.site != instance.changed_networkport.asset.site:
            conflicts.append({"field": "network_port",
                              "message": 'Connections must in the same datacenter.'})
        if instance.changed_networkport.connection and \
                instance.changed_networkport.connection.connection is not None and \
                instance.changed_networkport.connection.connection.id != instance.changed_networkport.id:
            conflicts.append({"field": "network_port",
                              "message": '{} is already connected to {} on {}'.format(
                                  instance.changed_networkport.connection.asset,
                                  instance.changed_networkport.connection.connection.asset,
                                  instance.changed_networkport.connection.label.name
                              )})

    instance.messages = messages
    instance.conflicts = conflicts


@receiver(pre_save, sender=PoweredDiff)
def powereddiff_message(sender, instance, *args, **kwargs):
    messages = []
    conflicts = []
    if instance.live_powered:
        if not instance.changed_powered:
            messages.append('UNPLUG POWER: ASSET {} FROM PORT {}{}'.format(
                instance.live_powered.asset.asset_number or instance.changed_powered.asset,
                instance.live_powered.pdu.position,
                instance.live_powered.plug_number
            ))
            instance.messages = messages
            instance.conflicts = conflicts
            return
        if instance.changed_powered.plug_number != instance.live_powered.plug_number:
            messages.append('OLD PLUG NUMBER: ' + str(instance.live_powered.plug_number) + ' | ' +
                            'NEW PLUG NUMBER: ' + str(instance.changed_powered.plug_number))
        if not versioned_equal(instance.changed_powered.pdu, instance.live_powered.pdu, PDU.IDENTITY_FIELDS):
            messages.append('OLD PDU: ' + str(instance.live_powered.pdu.rack.rack) + ' ' +
                            str(instance.live_powered.pdu.position) + ' | ' +
                            'NEW PDU: ' + str(instance.changed_powered.pdu.rack.rack) + ' ' +
                            str(instance.changed_powered.pdu.position))
    else:
        messages.append('SET POWER PLUG: ASSET {} TO PORT {}{}'.format(
            instance.changed_powered.asset.asset_number or instance.changed_powered.asset,
            instance.changed_powered.pdu.position,
            instance.changed_powered.plug_number
        ))

    num_powered = len(Powered.objects.filter(asset=instance.changed_powered.asset))
    if instance.changed_powered not in Powered.objects.all() and num_powered == instance.changed_powered.asset.itmodel.power_ports:
        conflicts.append({"field": "power_port",
                          "message": 'All the power port connections have already been used.'})
    if instance.changed_powered.pdu.assets.count() > 24:
        conflicts.append({"field": "power_port",
                          "message": 'This PDU is already full.'})
    if instance.changed_powered.pdu.rack != instance.changed_powered.asset.rack:
        conflicts.append({"field": "power_port",
                          "message": 'PDU must be on the same rack as the asset.'})
    instance.messages = messages
    instance.conflicts = conflicts
