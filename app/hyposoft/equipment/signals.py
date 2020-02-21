from django.db.models.signals import pre_save, post_save, pre_delete
from django.dispatch import receiver
from .models import ITModel, Asset, Powered, NetworkPortLabel, Rack, PDU
from rest_framework.serializers import ValidationError


# @receiver(post_save, sender=ITModel)
# def add_network_ports(sender, instance,  *args, **kwargs):
#     network_port_name_1 = NetworkPortLabel.objects.create(name=instance.network_port_name_1, itmodel=instance)
#     network_port_name_1.save()
#     network_port_name_2 = NetworkPortLabel.objects.create(name=instance.network_port_name_2, itmodel=instance)
#     network_port_name_2.save()
#     network_port_name_3 = NetworkPortLabel.objects.create(name=instance.network_port_name_3, itmodel=instance)
#     network_port_name_3.save()
#     network_port_name_4 = NetworkPortLabel.objects.create(name=instance.network_port_name_4, itmodel=instance)
#     network_port_name_4.save()


@receiver(pre_save, sender=Asset)
def auto_fill_asset(sender, instance, *args, **kwargs):
    instance.datacenter = instance.rack.datacenter
    if not instance.mac_address:
        instance.mac_address = None
    else:
        new = instance.mac_address.lower().replace('-', ':').replace('_', ':')
        if len(new) == 12:
            new = ':'.join([new[b:b+2] for b in range(0, 12, 2)])
        instance.mac_address = new


@receiver(pre_save, sender=Powered)
def check_pdu(sender, instance, *args, **kwargs):
    if instance.pdu.assets.count() > 24:
        raise ValidationError("This PDU is already full.")


@receiver(pre_save, sender=NetworkPortLabel)
def set_default_npl(sender, instance, *args, **kwargs):
    if instance.name == "":
        labels = sender.objects.filter(itmodel=instance.itmodel)
        highest = 0
        for label in labels:
            if label.name.isnumeric():
                digit = int(label.name[0])
                if digit > highest:
                    highest = digit
        instance.name = str(highest + 1)


@receiver(post_save, sender=Rack)
def add_PDUs(sender, instance, created, *args, **kwargs):
    if created:
        left = PDU.objects.create(rack=instance, position=PDU.Position.LEFT)
        left.save()
        right = PDU.objects.create(rack=instance, position=PDU.Position.RIGHT)
        right.save()
