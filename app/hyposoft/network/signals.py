from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from rest_framework import serializers

from equipment.models import Asset
from .models import NetworkPortLabel, NetworkPort

@receiver(post_save, sender=Asset)
def set_default_np(sender, instance, *args, **kwargs):
    labels = instance.itmodel.networkportlabel_set
    ports = instance.networkport_set
    for label in labels.all():
        if not ports.filter(label=label).exists():
            NetworkPort.objects.create(asset=instance, label=label, connection=None).save()


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
