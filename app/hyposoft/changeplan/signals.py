from django.contrib.auth.signals import user_logged_in
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import ChangePlan, AssetDiff, NetworkPortDiff, PoweredDiff
from django.db.models.signals import pre_save


@receiver(user_logged_in)
def create_live(*args, **kwargs):
    if not ChangePlan.objects.filter(id=0).exists():
        ChangePlan.objects.create(id=0, owner=User.objects.filter(username="admin").first(), name="live")


@receiver(pre_save, sender=AssetDiff)
def assetdiff_message(sender, instance, *args, **kwargs):
    message = ''
    if instance.live_asset:
        message += ('UPDATED ASSET' + '\n')
        if instance.changed_asset.asset_number != instance.live_asset.asset_number:
            message += ('OLD ASSET NUMBER: ' + str(instance.live_asset.asset_number) + '\n')
            message += ('NEW ASSET NUMBER: ' + str(instance.changed_asset.asset_number) + '\n')
        if instance.changed_asset.hostname != instance.live_asset.hostname:
            message += ('OLD HOSTNAME: ' + str(instance.live_asset.hostname) + '\n')
            message += ('NEW HOSTNAME: ' + str(instance.changed_asset.hostname) + '\n')
        if instance.changed_asset.rack != instance.live_asset.rack:
            message += ('OLD RACK: ' + str(instance.live_asset.rack.rack) + '\n')
            message += ('NEW RACK: ' + str(instance.changed_asset.rack.rack) + '\n')
        if instance.changed_asset.rack_position != instance.live_asset.rack_position:
            message += ('OLD RACK POSITION: ' + str(instance.live_asset.rack_position) + '\n')
            message += ('NEW RACK POSITION: ' + str(instance.changed_asset.rack_position) + '\n')
        if instance.changed_asset.itmodel != instance.live_asset.itmodel:
            message += ('OLD ITMODEL: ' + str(instance.live_asset.itmodel.model_number) + 'by' +
                        str(instance.live_asset.itmodel.vendor) + '\n')
            message += ('NEW ITMODEL: ' + str(instance.changed_asset.itmodel.model_number) + 'by' +
                        str(instance.changed_asset.itmodel.vendor) + '\n')
        if instance.changed_asset.owner != instance.live_asset.owner:
            message += ('OLD OWNER: ' + str(instance.live_asset.user.username) + '\n')
            message += ('NEW OWNER: ' + str(instance.changed_asset.user.username) + '\n')
        if instance.changed_asset.comment != instance.live_asset.comment:
            message += ('OLD COMMENT: ' + str(instance.live_asset.comment) + '\n')
            message += ('NEW COMMENT: ' + str(instance.changed_asset.comment) + '\n')
        if instance.live_asset.decommissioned_timestamp:
            message += ('CONFLICT: LIVE ASSET IS DECOMMISSIONED' + '\n')
    else:
        message += ('CREATED ASSET' + '\n')
        message += ('ASSET NUMBER: ' + str(instance.changed_asset.asset_number) + '\n')
        message += ('HOSTNAME: ' + str(instance.changed_asset.hostname) + '\n')
        message += ('RACK: ' + str(instance.changed_asset.rack.rack) + '\n')
        message += ('RACK POSITION: ' + str(instance.changed_asset.rack_position) + '\n')
        message += ('ITMODEL: ' + str(instance.changed_asset.itmodel.model_number) + 'by' +
                    str(instance.changed_asset.itmodel.vendor) + '\n')
        message += ('OWNER: ' + str(instance.changed_asset.user.username) + '\n')
        message += ('COMMENT: ' + str(instance.changed_asset.comment) + '\n')
        message += ('COMMISSIONED: ' + str(instance.changed_asset.commissioned) + '\n')
        message += ('DECOMMISSIONED TIMESTAMP: ' + str(instance.changed_asset.decommissioned_timestamp) + '\n')
        message += ('DECOMMISSIONED BY: ' + str(instance.changed_asset.decommissioned_by.username) + '\n')
    instance.message = message


@receiver(pre_save, sender=NetworkPortDiff)
def networkportdiff_message(sender, instance, *args, **kwargs):
    message = ''
    if instance.live_networkport:
        message += ('UPDATED NETWORKPORT' + '\n')
        if instance.changed_networkport.asset != instance.live_networkport.asset:
            message += ('OLD ASSET: ' + str(instance.live_networkport.asset.asset_number) + '\n')
            message += ('NEW ASSET: ' + str(instance.changed_networkport.asset.asset_number) + '\n')
        if instance.changed_networkport.label != instance.live_networkport.label:
            message += ('OLD LABEL: ' + str(instance.live_networkport.label.name) + '\n')
            message += ('NEW LABEL: ' + str(instance.changed_networkport.label.name) + '\n')
        if instance.changed_networkport.mac_address != instance.live_networkport.mac_address:
            message += ('OLD MAC ADDRESS: ' + str(instance.live_networkport.mac_address) + '\n')
            message += ('NEW MAC ADDRESS: ' + str(instance.changed_networkport.mac_address) + '\n')
        if instance.changed_networkport.connection != instance.live_networkport.connection:
            message += ('OLD CONNECTION: ' + str(instance.live_networkport.connection.asset.asset_number) + ' ' +
                        str(instance.live_networkport.connection.label.name) + '\n')
            message += ('NEW CONNECTION: ' + str(instance.changed_networkport.connection.asset.asset_number) + ' ' +
                        str(instance.changed_networkport.connection.label.name) + '\n')
    else:
        message += ('CREATED NETWORKPORT' + '\n')
        message += ('ASSET: ' + str(instance.changed_networkport.asset.asset_number) + '\n')
        message += ('LABEL: ' + str(instance.changed_networkport.label.name) + '\n')
        message += ('MAC ADDRESS: ' + str(instance.changed_networkport.mac_address) + '\n')
        message += ('CONNECTION: ' + str(instance.changed_networkport.connection.asset.asset_number) + ' ' +
                    str(instance.changed_networkport.connection.label.name) + '\n')
    instance.message = message


@receiver(pre_save, sender=PoweredDiff)
def powereddiff_message(sender, instance, *args, **kwargs):
    message = ''
    if instance.live_powered:
        message += ('UPDATED POWERED' + '\n')
        if instance.changed_powered.plug_number != instance.live_powered.plug_number:
            message += ('OLD PLUG NUMBER: ' + str(instance.live_powered.plug_number) + '\n')
            message += ('NEW PLUG NUMBER: ' + str(instance.changed_powered.plug_number) + '\n')
        if instance.changed_powered.pdu != instance.live_powered.pdu:
            message += ('OLD PDU: ' + str(instance.live_powered.pdu.rack.rack) + ' ' +
                        str(instance.live_powered.pdu.position) + '\n')
            message += ('NEW PDU: ' + str(instance.changed_powered.pdu.rack.rack) + ' ' +
                        str(instance.changed_powered.pdu.position) + '\n')
        if instance.changed_powered.asset != instance.live_powered.asset:
            message += ('OLD ASSET: ' + str(instance.live_powered.asset.asset_number) + '\n')
            message += ('NEW ASSET: ' + str(instance.changed_powered.asset.asset_number) + '\n')
        if instance.changed_powered.on != instance.live_powered.on:
            message += ('OLD ON: ' + str(instance.live_powered.on) + '\n')
            message += ('NEW ON: ' + str(instance.changed_powered.on) + '\n')
    else:
        message += ('CREATED POWERED' + '\n')
        message += ('PLUG NUMBER: ' + str(instance.changed_powered.plug_number) + '\n')
        message += ('PDU: ' + str(instance.changed_powered.pdu.rack.rack) + ' ' +
                    str(instance.changed_powered.pdu.position) + '\n')
        message += ('ASSET: ' + str(instance.changed_powered.asset.asset_number) + '\n')
        message += ('ON: ' + str(instance.changed_powered.on) + '\n')
    instance.message = message
