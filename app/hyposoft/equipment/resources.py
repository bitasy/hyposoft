import re

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db.models import Max
from import_export import resources, fields

from equipment.handlers import create_itmodel_extra, create_asset_extra
from changeplan.models import ChangePlan
from .models import ITModel, Asset, Rack, Datacenter
from network.models import NetworkPortLabel
from power.models import Powered, PDU
from import_export.widgets import ForeignKeyWidget


class ITModelResource(resources.ModelResource):

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
        current = [label['name'] for label in ITModel.objects.first().networkportlabel_set.order_by('order').values()]
        if len(current) > my_network_ports >= 4:
            raise ValidationError(
                'Cannot decrease amount of network ports.'
            )

        my_model.networkportlabel_sett.delete()

        special = []
        for i in range(1, min(5, my_network_ports + 1)):
            special.append(row['network_port_name_' + str(i)])

        create_itmodel_extra(my_model, special + current)


class AssetResource(resources.ModelResource):

    class RackForeignKeyWidget(ForeignKeyWidget):
        def clean(self, value, row):
            my_rack = row['rack']
            my_datacenter = Datacenter.objects.get(abbr=row['datacenter'])
            if not my_rack[-2].isdigit() and my_rack[-1].isdigit():
                new_rack = my_rack[:-1] + '0' + my_rack[-1:]
                return self.model.objects.get(
                    rack=new_rack,
                    datacenter=my_datacenter
                )
            else:
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
    power_port_connection_1 = fields.Field()
    power_port_connection_2 = fields.Field()

    def dehydrate_power_port_connection_1 (self, asset):
        try:
            if asset.itmodel.power_ports >= 1:
                my_powered = Powered.objects.get(asset=asset, special=1)
                return str(my_powered.pdu.position) + str(my_powered.plug_number)
            else:
                return ''
        except:
            return ''

    def dehydrate_power_port_connection_2(self, asset):
        try:
            if asset.itmodel.power_ports >= 2:
                my_powered = Powered.objects.get(asset=asset, special=2)
                return str(my_powered.pdu.position) + str(my_powered.plug_number)
            else:
                return ''
        except:
            return ''

    class Meta:
        model = Asset
        exclude = ('id', 'itmodel', 'commissioned', 'decommissioned_by', 'decommissioned_timestamp', 'version')
        import_id_fields = ('hostname', 'vendor', 'model_number')
        export_order = ('asset_number', 'datacenter', 'hostname', 'rack', 'rack_position', 'vendor', 'model_number',
                        'owner', 'comment', 'power_port_connection_1', 'power_port_connection_2')
        skip_unchanged = True
        report_skipped = True
        clean_model_instances = True

    def before_import_row(self, row, **kwargs):
        if row['asset_number'] == '':
            try:
                exists = Asset.objects.get(hostname=row['hostname'])
                row['asset_number'] = exists.asset_number
            except:
                max_an = Asset.objects.all().aggregate(Max('asset_number'))
                row['asset_number'] = (max_an['asset_number__max'] or 100000) + 1

    def after_import_row(self, row, row_result, **kwargs):
        my_asset = Asset.objects.get(asset_number=row['asset_number'])
        my_datacenter = Datacenter.objects.get(abbr=row['datacenter'])
        my_rack = Rack.objects.get(rack=row['rack'], datacenter=my_datacenter)

        current = [{'pdu_id': port['pdu'], 'plug': port['plug_number']}
                   for port in my_asset.powered_set.values('pdu', 'plug_number')]

        my_asset.powered_set.delete()

        special = []
        for i in range(1, min(3, my_asset.itmodel.power_ports + 1)):
            pc = row['power_port_connection_' + str(i)]
            split = re.search(r"\d", pc).start()
            position = pc[:split]
            plug = int(pc[split:])
            special.append({'pdu_id': PDU.objects.get(rack=my_rack, position=position), 'plug': plug})

        create_asset_extra(
            my_asset,
            ChangePlan.objects.get(0), # todo handle creating new change plan for bulk to get diff
            # requires getting version through the view and setting parent changeplan
            special + current,
            None
        )
