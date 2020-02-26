from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import ITModel, Asset, Powered, NetworkPortLabel, Rack, PDU, NetworkPort
from .views import get_pdu
from rest_framework import serializers


@receiver(pre_save, sender=ITModel)
def check_deployed_assets(sender, instance, *args, **kwargs):
    if instance.asset_set.count() == 0:
        return

    def throw():
        raise serializers.ValidationError(
            "Cannot modify interconnected ITModel attributes while assets are deployed."
        )

    try:
        old = ITModel.objects.get(id=instance.id)
        if old.power_ports != instance.power_ports:
            throw()
        if old.network_ports != instance.network_ports:
            throw()
        if old.height != instance.height:
            throw()

    except ITModel.DoesNotExist:
        pass


@receiver(pre_save, sender=Asset)
def auto_fill_asset(sender, instance, *args, **kwargs):
    if instance.datacenter is not None and instance.datacenter != instance.rack.datacenter:
        raise serializers.ValidationError(
            "Asset datacenter cannot be different from rack datacenter.")

    instance.datacenter = instance.rack.datacenter
    if not instance.mac_address == "":
        new = (instance.mac_address or "").lower().replace('-', '').replace('_', '').replace(':', '')
        new = ':'.join([new[b:b + 2] for b in range(0, 12, 2)])
        instance.mac_address = new


@receiver(pre_save, sender=Powered)
def check_pdu(sender, instance, *args, **kwargs):
    num_powered = len(Powered.objects.filter(asset=instance.asset))
    if instance not in Powered.objects.all() and num_powered == instance.asset.itmodel.power_ports:
        raise serializers.ValidationError("All the power port connections have already been used.")
    if instance.pdu.assets.count() > 24:
        raise serializers.ValidationError("This PDU is already full.")
    if instance.pdu.rack != instance.asset.rack:
        raise serializers.ValidationError(
            "PDU must be on the same rack as the asset.")


@receiver(pre_save, sender=NetworkPortLabel)
def set_default_npl(sender, instance, *args, **kwargs):
    num_labels = len(NetworkPortLabel.objects.filter(itmodel=instance.itmodel))
    if instance not in NetworkPortLabel.objects.all() and num_labels == instance.itmodel.network_ports:
        raise serializers.ValidationError("All the network ports have already been labeled.")
    else:
        if instance.name == "":
            labels = sender.objects.filter(itmodel=instance.itmodel)
            nums = []
            for label in labels:
                if label.name.isdigit():
                    digit = int(label.name[0])
                    nums.append(digit)
            for i in range(1, instance.itmodel.network_ports):
                if i not in nums:
                    instance.name = str(i)
                    break


@receiver(pre_save, sender=PDU)
def set_connected(sender, instance, *args, **kwargs):
    if instance.rack.datacenter.abbr == 'rtp1':
        response = get_pdu(instance.rack.rack, instance.position)
        instance.networked = response[1] < 400
    else:
        instance.networked = False


@receiver(post_save, sender=Rack)
def add_PDUs(sender, instance, created, *args, **kwargs):
    if created:
        left = PDU.objects.create(rack=instance, position=PDU.Position.LEFT)
        left.save()
        right = PDU.objects.create(rack=instance, position=PDU.Position.RIGHT)
        right.save()


@receiver(pre_save, sender=NetworkPort)
def check_connection(sender, instance, *args, **kwargs):
    if instance.connection:
        if instance.asset == instance.connection.asset:
            raise serializers.ValidationError(
                "Connections must be between different assets.")

        if instance.connection.asset.datacenter != instance.asset.datacenter:
            raise serializers.ValidationError(
                "Connections must be in the same datacenter.")

        if instance.connection.connection is not None and instance.connection.connection.id is not instance.id:
            raise serializers.ValidationError(
                "{} is already connected to {} on {}".format(
                    instance.connection.asset,
                    instance.connection.connection.asset,
                    instance.connection.label.name
                )
            )

    old = NetworkPort.objects.filter(id=instance.id).first()
    if old and old.connection is not None:
        NetworkPort.objects.filter(id=old.connection.id).update(connection=None)  # Doesn't trigger pre-save signal


@receiver(post_save, sender=NetworkPort)
def set_connection(sender, instance, *args, **kwargs):
    if instance.connection:
        if instance.connection.connection is None or instance.connection.connection.id is not instance.id:
            instance.connection.connection = instance
            instance.connection.save()
