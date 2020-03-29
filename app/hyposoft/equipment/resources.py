from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db.models import Max
from import_export import resources, fields

from equipment.handlers import create_itmodel_extra, create_asset_extra
from changeplan.models import ChangePlan
from .models import ITModel, Asset, Rack, Datacenter
from network.models import NetworkPortLabel
from power.models import Powered, PDU
from import_export.widgets import ForeignKeyWidget, Widget

import re


class VersionedResource(resources.ModelResource):
    def __init__(self, version, owner, force=False):
        super(VersionedResource, self).__init__()
        self.version = version
        self.owner = owner
        self.force = force


class ITModelResource(VersionedResource):
    network_port_name_1 = fields.Field()
    network_port_name_2 = fields.Field()
    network_port_name_3 = fields.Field()
    network_port_name_4 = fields.Field()

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
        my_model = ITModel.objects.get(vendor=row['vendor'], model_number=row['model_number'])
        my_network_ports = int(row['network_ports'])
        current = [label['name'] for label in my_model.networkportlabel_set.order_by('order').values()]
        if len(current) > my_network_ports >= 4:
            raise ValidationError(
                'Cannot decrease amount of network ports.'
            )

        my_model.networkportlabel_set.all().delete()

        special = []
        for i in range(1, min(5, my_network_ports + 1)):
            special.append(row['network_port_name_' + str(i)])

        create_itmodel_extra(my_model, special + current)


class AssetResource(VersionedResource):
    class RackForeignKeyWidget(ForeignKeyWidget):
        def clean(self, value, row):
            my_rack = row['rack']
            my_datacenter = Datacenter.objects.get(abbr=row['datacenter'])
            return self.model.objects.get(
                rack=my_rack,
                datacenter=my_datacenter
            )

    class ITModelForeignKeyWidget(ForeignKeyWidget):
        def clean(self, value, row):
            return self.model.objects.get(
                vendor__iexact=row['vendor'],
                model_number__iexact=row['model_number']
            )

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
                my_powered = Powered.objects.get(asset=asset, order=1)
                return str(my_powered.pdu.position) + str(my_powered.plug_number)
            else:
                return ''
        except:
            return ''

    def dehydrate_power_port_connection_2(self, asset):
        try:
            if asset.itmodel.power_ports >= 2:
                my_powered = Powered.objects.get(asset=asset, order=2)
                return str(my_powered.pdu.position) + str(my_powered.plug_number)
            else:
                return ''
        except:
            return ''

    class Meta:
        model = Asset
        exclude = ('id', 'itmodel', 'commissioned', 'decommissioned_by', 'decommissioned_timestamp')
        import_id_fields = ('hostname', 'vendor', 'model_number')
        export_order = ('asset_number', 'datacenter', 'hostname', 'rack', 'rack_position', 'vendor', 'model_number',
                        'owner', 'comment', 'power_port_connection_1', 'power_port_connection_2')
        skip_unchanged = True
        report_skipped = True
        clean_model_instances = True

    def before_import_row(self, row, **kwargs):
        if row['asset_number'] == '' and self.version == 0:
            try:
                exists = Asset.objects.get(hostname=row['hostname'])
                row['asset_number'] = exists.asset_number
            except:
                max_an = Asset.objects.all().aggregate(Max('asset_number'))
                row['asset_number'] = (max_an['asset_number__max'] or 100000) + 1
        elif row['asset_number'] == '':
            row['asset_number'] = None

        row['version'] = self.version

    def after_import_row(self, row, row_result, **kwargs):
        try:
            my_asset = Asset.objects.get(id=row_result.object_id)
        except:
            return  # skip
        my_datacenter = Datacenter.objects.get(abbr=row['datacenter'])
        my_rack = Rack.objects.get(rack=row['rack'], datacenter=my_datacenter, version=self.version)

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

        if self.force:
            new_version = ChangePlan.objects.get(id=self.version)
        else:
            parent = ChangePlan.objects.get(id=self.version)
            new_version = ChangePlan.objects.create(
                owner=self.owner,
                name="_BULK_IMPORT_" + str(id(self)),
                executed=False,
                auto_created=True,
                parent=parent
            )

        create_asset_extra(
            my_asset,
            new_version,
            special + current,
            None
        )
