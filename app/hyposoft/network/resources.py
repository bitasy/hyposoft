from django.core.exceptions import ValidationError
from import_export import resources, fields
from equipment.models import Asset
from network.models import NetworkPortLabel, NetworkPort
from import_export.widgets import ForeignKeyWidget


class NetworkPortResource(resources.ModelResource):

    class SrcAssetForeignKeyWidget(ForeignKeyWidget):
        def clean(self, value, row):
            my_asset = Asset.objects.get(hostname=row['src_hostname'])
            return my_asset

    class SrcLabelForeignKeyWidget(ForeignKeyWidget):
        def clean(self, value, row):
            my_asset = Asset.objects.get(hostname=row['src_hostname'])
            return self.model.objects.get(
                name__iexact=row['src_port'],
                itmodel__vendor__iexact=my_asset.itmodel.vendor,
                itmodel__model_number__iexact=my_asset.itmodel.model_number
            )

    src_hostname = fields.Field(
        column_name='src_hostname',
        attribute='asset',
        widget=SrcAssetForeignKeyWidget(Asset, 'hostname')
    )
    src_port = fields.Field(
        column_name='src_port',
        attribute='label',
        widget=SrcLabelForeignKeyWidget(NetworkPortLabel, 'name')
    )
    src_mac = fields.Field(
        column_name='src_mac',
        attribute='asset',
        widget=SrcAssetForeignKeyWidget(Asset, 'mac_address')
    )
    dest_hostname = fields.Field()
    dest_port = fields.Field()

    def dehydrate_src_mac(self, networkport):
        try:
            if networkport.asset.mac_address:
                return networkport.asset.mac_address
            else:
                return ''
        except:
            return ''

    def dehydrate_dest_hostname(self, networkport):
        try:
            if networkport.connection:
                return networkport.connection.asset.hostname
            else:
                return ''
        except:
            return ''

    def dehydrate_dest_port(self, networkport):
        try:
            if networkport.connection:
                return networkport.connection.label.name
            else:
                return ''
        except:
            return ''

    class Meta:
        model = NetworkPort
        exclude = ('id', 'asset', 'label', 'connection', 'version')
        import_id_fields = ('src_hostname', 'src_port')
        export_order = ('src_hostname', 'src_port', 'src_mac', 'dest_hostname', 'dest_port')
        skip_unchanged = True
        report_skipped = True
        clean_model_instances = True

    def after_import_row(self, row, row_result, **kwargs):
        my_src_asset = Asset.objects.get(hostname=row['src_hostname'])
        my_src_asset.mac_address = row['src_mac']
        my_src_asset.save()
        my_src_label = NetworkPortLabel.objects.get(name=row['src_port'], itmodel=my_src_asset.itmodel)
        my_src_network_port = NetworkPort.objects.get(asset=my_src_asset, label=my_src_label)

        if (row['dest_hostname'] == '' and row['dest_port'] != '') or (row['dest_hostname'] != '' and row['dest_port'] == ''):
            raise ValidationError(
                "These fields must both be empty or set")

        if row['dest_hostname'] != '' and row['dest_port'] != '':
            my_dest_asset = Asset.objects.get(hostname=row['dest_hostname'])
            my_dest_label = NetworkPortLabel.objects.get(name=row['dest_port'], itmodel=my_dest_asset.itmodel)
            try:
                exists_dest = NetworkPort.objects.get(asset=my_dest_asset, label=my_dest_label)
                exists_dest.connection = my_src_network_port
                my_src_network_port.connection = exists_dest
                exists_dest.save()
            except:
                my_dest_network_port = NetworkPort.objects.create(asset=my_dest_asset, label=my_dest_label)
                my_dest_network_port.connection = my_src_network_port
                my_src_network_port.connection = my_dest_network_port
                my_dest_network_port.save()
            my_src_network_port.save()

        else:
            try:
                my_dest_network_port = NetworkPort.objects.get(connection=my_src_network_port)
                my_dest_network_port.connection = None
                my_dest_network_port.save()
                my_src_network_port.connection = None
                my_src_network_port.save()
            except:
                my_src_network_port.connection = None
                my_src_network_port.save()

    def export(self, queryset=None, *args, **kwargs):
        if queryset is None:
            queryset = self.get_queryset()
        for network_connection in queryset.all():
            src = network_connection
            dest = network_connection.connection
            if dest:
                if src.asset.itmodel.network_ports > dest.asset.itmodel.network_ports:
                    queryset = queryset.exclude(id=src.id)
                elif src.asset.itmodel.network_ports == dest.asset.itmodel.network_ports:
                    if src.asset.asset_number > dest.asset.asset_number:
                        queryset = queryset.exclude(id=src.id)
        return super(NetworkPortResource, self).export(queryset, *args, **kwargs)
    