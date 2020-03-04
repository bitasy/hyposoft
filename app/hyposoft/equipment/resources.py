from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db.models import Max
from import_export import resources, fields
from .models import ITModel, Asset, Rack, Datacenter
from network.models import NetworkPortLabel, NetworkPort
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
                my_network_port_label = NetworkPortLabel.objects.get(itmodel=itmodel, special=1)
                return my_network_port_label.name
            else:
                return ''
        except:
            return ''

    def dehydrate_network_port_name_2(self, itmodel):
        try:
            if itmodel.network_ports >= 2:
                my_network_port_label = NetworkPortLabel.objects.get(itmodel=itmodel, special=2)
                return my_network_port_label.name
            else:
                return ''
        except:
            return ''

    def dehydrate_network_port_name_3(self, itmodel):
        try:
            if itmodel.network_ports >= 3:
                my_network_port_label = NetworkPortLabel.objects.get(itmodel=itmodel, special=3)
                return my_network_port_label.name
            else:
                return ''
        except:
            return ''

    def dehydrate_network_port_name_4(self, itmodel):
        try:
            if itmodel.network_ports >= 4:
                my_network_port_label = NetworkPortLabel.objects.get(itmodel=itmodel, special=4)
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
        curr_network_ports = len(NetworkPortLabel.objects.filter(itmodel=my_model))
        if curr_network_ports > my_network_ports >= 4:
            raise ValidationError(
                'Cannot decrease amount of network ports.'
            )
        elif curr_network_ports > my_network_ports:
            if my_network_ports == 3:
                NetworkPortLabel.objects.filter(itmodel=my_model, special=4).delete()
            elif my_network_ports == 2:
                NetworkPortLabel.objects.filter(itmodel=my_model, special=4).delete()
                NetworkPortLabel.objects.filter(itmodel=my_model, special=3).delete()
            elif my_network_ports == 1:
                NetworkPortLabel.objects.filter(itmodel=my_model, special=4).delete()
                NetworkPortLabel.objects.filter(itmodel=my_model, special=3).delete()
                NetworkPortLabel.objects.filter(itmodel=my_model, special=2).delete()
            elif my_network_ports == 1:
                NetworkPortLabel.objects.filter(itmodel=my_model, special=4).delete()
                NetworkPortLabel.objects.filter(itmodel=my_model, special=3).delete()
                NetworkPortLabel.objects.filter(itmodel=my_model, special=2).delete()
                NetworkPortLabel.objects.filter(itmodel=my_model, special=1).delete()
            # network_port_name_1
        if my_network_ports >= 1:
            if row['network_port_name_1'] == '':
                my_name_1 = '1'
            else:
                my_name_1 = row['network_port_name_1']
            try:
                exists_1 = NetworkPortLabel.objects.get(itmodel=my_model, special=1)
                exists_1.name = my_name_1
                exists_1.save()
            except:
                network_port_name_1 = NetworkPortLabel.objects.create(name=my_name_1, itmodel=my_model, special=1)
        # network_port_name_2
        if my_network_ports >= 2:
            if row['network_port_name_2'] == '':
                my_name_2 = '2'
            else:
                my_name_2 = row['network_port_name_2']
            try:
                exists_2 = NetworkPortLabel.objects.get(itmodel=my_model, special=2)
                exists_2.name = my_name_2
                exists_2.save()
            except:
                network_port_name_2 = NetworkPortLabel.objects.create(name=my_name_2, itmodel=my_model, special=2)
        # network_port_name_3
        if my_network_ports >= 3:
            if row['network_port_name_3'] == '':
                my_name_3 = '3'
            else:
                my_name_3 = row['network_port_name_3']
            try:
                exists_3 = NetworkPortLabel.objects.get(itmodel=my_model, special=3)
                exists_3.name = my_name_3
                exists_3.save()
            except:
                network_port_name_3 = NetworkPortLabel.objects.create(name=my_name_3, itmodel=my_model, special=3)
        # network_port_name_4
        if my_network_ports == 4:
            if row['network_port_name_4'] == '':
                my_name_4 = '4'
            else:
                my_name_4 = row['network_port_name_4']
            try:
                exists_4 = NetworkPortLabel.objects.get(itmodel=my_model, special=4)
                exists_4.name = my_name_4
                exists_4.save()
            except:
                network_port_name_4 = NetworkPortLabel.objects.create(name=my_name_4, itmodel=my_model, special=4)
        if my_network_ports > 4:
            for i in range(5, my_network_ports+1):
                if i > curr_network_ports:
                    network_port_name_n = NetworkPortLabel.objects.create(name=str(i), itmodel=my_model)


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
        exclude = ('id', 'itmodel', 'mac_address')
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
        my_model = ITModel.objects.get(model_number=row['model_number'], vendor=row['vendor'])
        my_asset = Asset.objects.get(asset_number=row['asset_number'])
        my_datacenter = Datacenter.objects.get(abbr=row['datacenter'])
        if not row['rack'][-2].isdigit() and row['rack'][-1].isdigit():
            new_rack = row['rack'][:-1] + '0' + row['rack'][-1:]
            my_rack = Rack.objects.get(rack=new_rack, datacenter=my_datacenter)
        else:
            my_rack = Rack.objects.get(rack=row['rack'], datacenter=my_datacenter)
        # power_port_connection_1
        if my_model.power_ports >= 1:
            powered_1 = row['power_port_connection_1']
            if powered_1 != '':
                my_position_1 = powered_1[0]
                my_plug_number_1 = powered_1[1:]
                my_pdu_1 = PDU.objects.get(rack=my_rack, position=my_position_1)
                try:
                    exists_1 = Powered.objects.get(
                        pdu=my_pdu_1,
                        asset=my_asset,
                        special=1
                    )
                    exists_1.plug_number = my_plug_number_1
                    exists_1.save()
                except:
                    power_port_connection_1 = Powered.objects.create(
                        plug_number=my_plug_number_1,
                        pdu=my_pdu_1,
                        asset=my_asset,
                        special=1
                    )
            else:
                try:
                    exists_1 = Powered.objects.get(
                        asset=my_asset,
                        special=1
                    )
                    exists_1.delete()
                except:
                    return

        # power_port_connection_2
        if my_model.power_ports >= 2:
            powered_2 = row['power_port_connection_2']
            if powered_2 != '':
                my_position_2 = powered_2[0]
                my_plug_number_2 = powered_2[1:]
                my_pdu_2 = PDU.objects.get(rack=my_rack, position=my_position_2)
                try:
                    exists_2 = Powered.objects.get(
                        pdu=my_pdu_2,
                        asset=my_asset,
                        special=2
                    )
                    exists_2.plug_number = my_plug_number_2
                    exists_2.save()
                except:
                    power_port_connection_2 = Powered.objects.create(
                        plug_number=my_plug_number_2,
                        pdu=my_pdu_2,
                        asset=my_asset,
                        special=2
                    )
            else:
                try:
                    exists_2 = Powered.objects.get(
                        asset=my_asset,
                        special=2
                    )
                    exists_2.delete()
                except:
                    return
