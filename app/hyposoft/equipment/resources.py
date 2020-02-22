from django.contrib.auth.models import User
from import_export import resources, fields
from .models import ITModel, Asset, Rack, NetworkPortLabel, Datacenter, Powered, PDU, NetworkPort
from import_export.widgets import ForeignKeyWidget


class ITModelResource(resources.ModelResource):

    class Meta:
        model = ITModel
        exclude = 'id'
        import_id_fields = ('vendor', 'model_number')
        export_order = ('vendor', 'model_number', 'height', 'display_color', 'network_ports',
                        'power_ports', 'cpu', 'memory', 'storage', 'comment')
        skip_unchanged = True
        report_skipped = True
        clean_model_instances = True

    def after_import_row(self, row, row_result, **kwargs):
        my_model = ITModel.objects.get(vendor=row['vendor'], model_number=row['model_number'])
        my_network_ports = int(row['network_ports'])
        # network_port_name_1
        if my_network_ports >= 1:
            if row['network_port_name_1'] == '':
                my_name_1 = '1'
            else:
                my_name_1 = row['network_port_name_1']
            network_port_name_1 = NetworkPortLabel.objects.create(name=my_name_1, itmodel=my_model, special=1)
            network_port_name_1.save()
        # network_port_name_2
        if my_network_ports >= 2:
            if row['network_port_name_2'] == '':
                my_name_2 = '2'
            else:
                my_name_2 = row['network_port_name_2']
            network_port_name_2 = NetworkPortLabel.objects.create(name=my_name_2, itmodel=my_model, special=2)
            network_port_name_2.save()
        # network_port_name_3
        if my_network_ports >= 3:
            if row['network_port_name_3'] == '':
                my_name_3 = '3'
            else:
                my_name_3 = row['network_port_name_3']
            network_port_name_3 = NetworkPortLabel.objects.create(name=my_name_3, itmodel=my_model, special=3)
            network_port_name_3.save()
        # network_port_name_4
        if my_network_ports >= 4:
            if row['network_port_name_4'] == '':
                my_name_4 = '4'
            else:
                my_name_4 = row['network_port_name_4']
            network_port_name_4 = NetworkPortLabel.objects.create(name=my_name_4, itmodel=my_model, special=4)
            network_port_name_4.save()


class AssetResource(resources.ModelResource):

    class MyForeignKeyWidget(ForeignKeyWidget):
        def clean(self, value, row):
            return self.model.objects.get(
                vendor__iexact=row["vendor"],
                model_number__iexact=row["model_number"]
            )

    datacenter = fields.Field(
        column_name='datacenter',
        attribute='datacenter',
        widget=ForeignKeyWidget(Datacenter, 'abbr')
    )
    rack = fields.Field(
        column_name='rack',
        attribute='rack',
        widget=ForeignKeyWidget(Rack, 'rack')
    )
    vendor = fields.Field(
        column_name='vendor',
        attribute='itmodel',
        widget=MyForeignKeyWidget(ITModel, 'vendor')
    )
    model_number = fields.Field(
        column_name='model_number',
        attribute='itmodel',
        widget=MyForeignKeyWidget(ITModel, 'model_number')
    )
    owner = fields.Field(
        column_name='owner',
        attribute='owner',
        widget=ForeignKeyWidget(User, 'username')
    )

    class Meta:
        model = Asset
        exclude = ('id', 'itmodel', 'mac_address')
        import_id_fields = 'asset_number'
        export_order = ('asset_number', 'datacenter', 'hostname', 'rack', 'rack_position', 'vendor', 'model_number',
                        'owner', 'comment')
        skip_unchanged = True
        report_skipped = True
        clean_model_instances = True

    def after_import_row(self, row, row_result, **kwargs):
        my_model = ITModel.objects.get(model_number=row['model_number'], vendor=row['vendor'])
        my_asset = Asset.objects.get(asset_number=row['asset_number'])
        my_datacenter = Datacenter.objects.get(abbr=row['datacenter'])
        my_rack = Rack.objects.get(rack=row['rack'], datacenter=my_datacenter)
        # power_port_connection_1
        if my_model.power_ports >= 1:
            powered_1 = row['power_port_connection_1']
            my_position_1 = powered_1[0]
            my_plug_number_1 = powered_1[1:]
            my_pdu_1 = PDU.objects.get(rack=my_rack, position=my_position_1)
            power_port_connection_1 = Powered.objects.create(
                plug_number=my_plug_number_1,
                pdu=my_pdu_1,
                asset=my_asset
            )
            power_port_connection_1.save()
        # power_port_connection_2
        if my_model.power_ports >= 2:
            powered_2 = row['power_port_connection_2']
            my_position_2 = powered_2[0]
            my_plug_number_2 = powered_2[1:]
            my_pdu_2 = PDU.objects.get(rack=my_rack, position=my_position_2)
            power_port_connection_2 = Powered.objects.create(
                plug_number=my_plug_number_2,
                pdu=my_pdu_2,
                asset=my_asset
            )
            power_port_connection_2.save()


class NetworkPortResource(resources.ModelResource):

    # src_hostname – string; matches the hostname of an existing asset in the system
    src_hostname = fields.Field(
        column_name='src_hostname',
        attribute='asset',
        widget=ForeignKeyWidget(Asset, 'hostname')
    )
    # src_port – string; matches a network port name defined by the source asset’s model
    src_port = fields.Field(
        column_name='src_port',
        attribute='label',
        widget=ForeignKeyWidget(NetworkPortLabel, 'name')
    )
    # src_mac – six-byte MAC address; format must comply with Requirement 2.2.1.5; sets this value for the associated src port
    src_mac = fields.Field(
        column_name='src_mac',
        attribute='asset',
        widget=ForeignKeyWidget(Asset, 'mac_address')
    )
    # dest_hostname – string; matches the hostname of an existing asset in the system; leaving blank will disconnect src port if it’s currently connected
    # dest_hostname = fields.Field(
    #     column_name='dest_hostname',
    #     attribute='connection.asset',
    #     widget=ForeignKeyWidget(Asset, 'hostname')
    # )
    # dest_port – string; matches a network port name defined by the destination asset’s model; must be given a value if a value is given for dest hostname; must be left blank if dest hostname is left blank
    # dest_port = fields.Field(
    #     column_name='dest_port',
    #     attribute='connection.label',
    #     widget=ForeignKeyWidget(NetworkPortLabel, 'name')
    # )

    class Meta:
        model = NetworkPort
        import_id_fields = ('src_hostname', 'src_port', 'src_mac', 'dest_hostname', 'dest_port')
        export_order = ('src_hostname', 'src_port', 'src_mac', 'dest_hostname', 'dest_port')
        skip_unchanged = True
        report_skipped = True
        clean_model_instances = True
