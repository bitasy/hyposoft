from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db.models import Max
from import_export import resources, fields
from import_export.resources import ModelResource
from rest_framework import serializers

from equipment.handlers import create_itmodel_extra, create_asset_extra
from changeplan.models import ChangePlan
from hyposoft.utils import versioned_object, add_asset, add_rack
from .models import ITModel, Asset, Rack, Datacenter
from network.models import NetworkPortLabel
from power.models import Powered, PDU
from import_export.widgets import ForeignKeyWidget

import re


class VersionedResource(resources.ModelResource):
    def __init__(self, version, owner, force=False):
        super(VersionedResource, self).__init__()
        self.version = ChangePlan.objects.get(id=version)
        self.owner = owner
        self.force = force

    def before_save_instance(self, instance, using_transactions, dry_run):
        if not self.force:
            self.version = self.get_new_version()

        instance.version = self.version

    def get_new_version(self):
        if self.force:
            new_version = ChangePlan.objects.get(id=self.version.id)
        else:
            parent = ChangePlan.objects.get(id=self.version.id)
            try:
                new_version = ChangePlan.objects.get(
                    owner=self.owner,
                    name="_BULK_IMPORT_" + str(id(self))
                )
            except ChangePlan.DoesNotExist:
                new_version = ChangePlan.objects.create(
                    owner=self.owner,
                    name="_BULK_IMPORT_" + str(id(self)),
                    executed=False,
                    auto_created=True,
                    parent=parent
                )
        return new_version


class ITModelResource(ModelResource):
    network_port_name_1 = fields.Field(attribute='network_port_name_1')
    network_port_name_2 = fields.Field(attribute='network_port_name_2')
    network_port_name_3 = fields.Field(attribute='network_port_name_3')
    network_port_name_4 = fields.Field(attribute='network_port_name_4')

    def skip_row(self, instance, original):
        port1 = getattr(instance, "network_port_name_1")
        port2 = getattr(instance, "network_port_name_2")
        port3 = getattr(instance, "network_port_name_3")
        port4 = getattr(instance, "network_port_name_4")
        new = [port for port in (port1, port2, port3, port4) if len(port) > 0]
        curr = original.networkportlabel_set.values_list("name", flat=True)

        if sorted(new) != sorted(curr):
            return False

        delattr(instance, "network_port_name_1")
        delattr(instance, "network_port_name_2")
        delattr(instance, "network_port_name_3")
        delattr(instance, "network_port_name_4")
        return super(ITModelResource, self).skip_row(instance, original)

    def dehydrate_network_port_name_1(self, itmodel):
        try:
            if itmodel.network_ports >= 1:
                my_network_port_label = NetworkPortLabel.objects.get(itmodel=itmodel, order=1)
                return my_network_port_label.name
            else:
                return ''
        except:
            return ''

    def dehydrate_network_port_name_2(self, itmodel):
        try:
            if itmodel.network_ports >= 2:
                my_network_port_label = NetworkPortLabel.objects.get(itmodel=itmodel, order=2)
                return my_network_port_label.name
            else:
                return ''
        except:
            return ''

    def dehydrate_network_port_name_3(self, itmodel):
        try:
            if itmodel.network_ports >= 3:
                my_network_port_label = NetworkPortLabel.objects.get(itmodel=itmodel, order=3)
                return my_network_port_label.name
            else:
                return ''
        except:
            return ''

    def dehydrate_network_port_name_4(self, itmodel):
        try:
            if itmodel.network_ports >= 4:
                my_network_port_label = NetworkPortLabel.objects.get(itmodel=itmodel, order=4)
                return my_network_port_label.name
            else:
                return ''
        except:
            return ''

    class Meta:
        model = ITModel
        exclude = 'id'
        import_id_fields = ('vendor', 'model_number')
        export_order = ('vendor', 'model_number', 'height', 'display_color', 'network_ports',
                        'power_ports', 'cpu', 'memory', 'storage', 'comment',
                        'network_port_name_1', 'network_port_name_2', 'network_port_name_3', 'network_port_name_4')
        skip_unchanged = True
        report_skipped = True
        clean_model_instances = True

    def after_import_row(self, row, row_result, **kwargs):
        if row_result.import_type == 'skip':
            return
        my_model = ITModel.objects.get(vendor=row['vendor'], model_number=row['model_number'])
        my_network_ports = int(row['network_ports'])
        current = [label['name'] for label in my_model.networkportlabel_set.order_by('order').values()]
        if len(current) > my_network_ports >= 4:
            raise ValidationError(
                'Cannot decrease amount of network ports.'
            )

        special = []
        for i in range(1, min(5, my_network_ports + 1)):
            special.append(row['network_port_name_' + str(i)])

        if special != current[:len(special)]:
            if my_model.asset_set.all().count() > 0:
                raise serializers.ValidationError(
                    "Cannot modify interconnected ITModel attributes while assets are deployed."
                )
            else:
                my_model.networkportlabel_set.all().delete()



        create_itmodel_extra(my_model, special + current)


class AssetResource(VersionedResource):
    class RackForeignKeyWidget(ForeignKeyWidget):
        def clean(self, value, row):
            my_rack = row['rack']
            my_datacenter = Datacenter.objects.get(abbr=row['datacenter'])
            rack = Rack.objects.filter(rack=my_rack, datacenter=my_datacenter)\
                .order_by("-version__id").first()
            return add_rack(rack, ChangePlan.objects.get(id=row['version']))

    class ITModelForeignKeyWidget(ForeignKeyWidget):
        def clean(self, value, row):
            return self.model.objects.get(
                vendor__iexact=row['vendor'],
                model_number__iexact=row['model_number']
            )

    class VersionWidget(ForeignKeyWidget):
        def clean(self, value, row=None, *args, **kwargs):
            if value is not None:
                return self.get_queryset(value, row, *args, **kwargs).get(**{self.field: value})
            else:
                return None


    datacenter = fields.Field(
        column_name='datacenter',
        attribute='datacenter',
        widget=ForeignKeyWidget(Datacenter, 'abbr')
    )
    rack = fields.Field(
        column_name='rack',
        attribute='rack',
        widget=RackForeignKeyWidget(Rack, 'rack')
    )
    vendor = fields.Field(
        column_name='vendor',
        attribute='itmodel',
        widget=ITModelForeignKeyWidget(ITModel, 'vendor')
    )
    model_number = fields.Field(
        column_name='model_number',
        attribute='itmodel',
        widget=ITModelForeignKeyWidget(ITModel, 'model_number')
    )
    owner = fields.Field(
        column_name='owner',
        attribute='owner',
        widget=ForeignKeyWidget(User, 'username')
    )
    power_port_connection_1 = fields.Field(attribute="power_port_connection_1")
    power_port_connection_2 = fields.Field(attribute="power_port_connection_2")
    version = fields.Field(
        attribute='version',
        widget=VersionWidget(ChangePlan, 'id')
    )

    def skip_row(self, instance, original):
        port1 = getattr(instance, "power_port_connection_1")
        port2 = getattr(instance, "power_port_connection_2")
        new = [port for port in (port1, port2) if len(port) > 0]
        curr = [port[0] + str(port[1]) for port in instance.powered_set.values_list("pdu__position", "plug_number")]

        if sorted(new) != sorted(curr):
            return False

        delattr(instance, "power_port_connection_1")
        delattr(instance, "power_port_connection_2")
        return super(AssetResource, self).skip_row(instance, original)

    def dehydrate_power_port_connection_1(self, asset):
        try:
            if asset.itmodel.power_ports >= 1:
                my_powered = Powered.objects.filter(asset=asset, order=1).first()
                if self.version.id != 0 and my_powered is None:
                    my_powered = Powered.objects.filter(
                        asset=versioned_object(asset, ChangePlan.objects.get(id=0), Asset.IDENTITY_FIELDS),
                        order=1
                    ).first()
                if my_powered:
                    return str(my_powered.pdu.position) + str(my_powered.plug_number)
                else:
                    return ''
        except:
            return ''

    def dehydrate_power_port_connection_2(self, asset):
        try:
            if asset.itmodel.power_ports >= 2:
                my_powered = Powered.objects.filter(asset=asset, order=2).first()
                if self.version.id != 0 and my_powered is None:
                    my_powered = Powered.objects.filter(
                        asset=versioned_object(asset, ChangePlan.objects.get(id=0), Asset.IDENTITY_FIELDS),
                        order=2
                    ).first()
                if my_powered:
                    return str(my_powered.pdu.position) + str(my_powered.plug_number)
                else:
                    return ''
        except:
            return ''

    class Meta:
        model = Asset
        exclude = ('id', 'itmodel', 'commissioned', 'decommissioned_by', 'decommissioned_timestamp')
        import_id_fields = ('hostname', 'vendor', 'model_number', 'version')
        export_order = ('asset_number', 'datacenter', 'hostname', 'rack', 'rack_position', 'vendor', 'model_number',
                        'owner', 'comment', 'power_port_connection_1', 'power_port_connection_2')
        skip_unchanged = True
        report_skipped = True
        clean_model_instances = True

    def before_import_row(self, row, **kwargs):
        if row['asset_number'] == '' and self.version.id == 0:
            try:
                exists = Asset.objects.get(hostname=row['hostname'])
                row['asset_number'] = exists.asset_number
            except:
                max_an = Asset.objects.all().aggregate(Max('asset_number'))
                row['asset_number'] = (max_an['asset_number__max'] or 100000) + 1
        elif row['asset_number'] == '':
            row['asset_number'] = None

        row['version'] = self.version.id

    def after_import_row(self, row, row_result, **kwargs):
        if row_result.import_type == 'skip':
            return
        try:
            my_asset = Asset.objects.get(id=row_result.object_id)
        except:
            return  # skip
        my_datacenter = Datacenter.objects.get(abbr=row['datacenter'])

        my_asset = add_asset(my_asset, self.version)
        my_rack = my_asset.rack

        special = []
        for i in range(1, min(3, my_asset.itmodel.power_ports + 1)):
            pc = row['power_port_connection_' + str(i)]
            if len(pc) > 0:
                try:
                    split = re.search(r"\d", pc).start()
                    position = pc[:split]
                    plug = int(pc[split:])
                    special.append({'pdu_id': PDU.objects.get(rack=my_rack, position=position), 'plug': plug})
                except AttributeError:
                    raise ValidationError('power_port_connection_' + str(i) + "formatted incorrectly")
                except PDU.DoesNotExist:
                    raise ValidationError(pc + " does not exit on the specified rack")
        current = []
        if len(special) >= 2:
            special_simple = [port['pdu_id'].position + str(port['plug']) for port in special]

            current = [{'pdu_id': port['pdu'], 'plug': port['plug_number']}
                       for port in my_asset.powered_set.order_by('order').values('pdu', 'plug_number')]

            for port in current:
                simple = port['pdu_id'].position + str(port['plug'])
                if simple in special_simple:
                    current.remove(simple)

        my_asset.powered_set.all().delete()

        if row_result.import_type == "new":
            ports = [{"label": port, "mac_address": None, "connection": None}
                     for port in
                     NetworkPortLabel.objects.filter(itmodel=my_asset.itmodel).values_list('name', flat=True)]
        else:
            ports = None
        my_asset.version = self.version
        create_asset_extra(
            my_asset,
            self.version,
            special + current,
            ports
        )

    def after_export(self, queryset, data, *args, **kwargs):
        del data['version']
