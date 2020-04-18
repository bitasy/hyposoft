from django.core.exceptions import ValidationError
from import_export import fields
from rest_framework import serializers

from equipment.models import Asset
from changeplan.models import ChangePlan
from network.models import NetworkPortLabel, NetworkPort
from import_export.widgets import ForeignKeyWidget

from equipment.resources import VersionedResource
from hyposoft.utils import versioned_queryset, versioned_object, add_network_conn, add_asset, newest_object


class NetworkPortResource(VersionedResource):
    class SrcAssetForeignKeyWidget(ForeignKeyWidget):
        def clean(self, value, row=None, *args, **kwargs):
            return newest_object(Asset, ChangePlan.objects.get(id=row['version']), hostname=row['src_hostname'])

    class SrcLabelForeignKeyWidget(ForeignKeyWidget):
        def clean(self, value, row=None, *args, **kwargs):
            my_asset = newest_object(Asset, ChangePlan.objects.get(id=row['version']), hostname=row['src_hostname'])
            return self.model.objects.get(
                name__iexact=row['src_port'],
                itmodel__vendor__iexact=my_asset.itmodel.vendor,
                itmodel__model_number__iexact=my_asset.itmodel.model_number
            )

    class VersionWidget(ForeignKeyWidget):
        def clean(self, value, row=None, *args, **kwargs):
            if value is not None:
                return self.get_queryset(value, row, *args, **kwargs).get(**{self.field: value})
            else:
                return None

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
        attribute='mac_address'
    )
    dest_hostname = fields.Field(attribute="dest_hostname")
    dest_port = fields.Field(attribute="dest_port")
    version = fields.Field(
        attribute='version',
        widget=VersionWidget(ChangePlan, 'id')
    )

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
        exclude = ('id', 'asset', 'label', 'connection')
        import_id_fields = ('src_hostname', 'src_port', 'version')
        export_order = ('src_hostname', 'src_port', 'src_mac', 'dest_hostname', 'dest_port')
        skip_unchanged = True
        report_skipped = True
        clean_model_instances = True

    def skip_row(self, instance, original):
        dest_host = newest_object(
            NetworkPort, self.version,
            asset__hostname=getattr(instance, 'dest_hostname'),
            label__name=getattr(instance, 'dest_port')
        )

        connected = dest_host.connection is not None and dest_host.connection.asset.hostname == instance.asset.hostname

        return original.mac_address == instance.mac_address and connected

    def before_import_row(self, row, **kwargs):
        row['version'] = self.version.id
        if len(row['src_mac']) == 0:
            row['src_mac'] = None

        if Asset.objects.filter(hostname=row['src_hostname']).count() == 0:
            raise ValidationError("Asset with hostname {} not found.".format(row['src_hostname']))

        if len(row['dest_hostname']) > 0 and Asset.objects.filter(hostname=row['dest_hostname']).count() == 0:
            raise ValidationError("Asset with hostname {} not found.".format(row['dest_hostname']))

    def after_import_row(self, row, row_result, **kwargs):
        if row_result.import_type == 'skip':
            return
        try:
            my_src_network_port = NetworkPort.objects.get(id=row_result.object_id)
        except:
            return

        if (row['dest_hostname'] == '' and row['dest_port'] != '') or (
                row['dest_hostname'] != '' and row['dest_port'] == ''):
            raise ValidationError(
                "These fields must both be empty or set")

        live = ChangePlan.objects.get(id=0)

        new_src_network_port = add_network_conn(my_src_network_port, self.version)
        new_src_network_port.asset = add_asset(
            newest_object(Asset, self.version, hostname=row['src_hostname']),
            self.version,
            ['hostname']
        )
        new_src_network_port.save()
        if row['dest_hostname'] != '' and row['dest_port'] != '':
            my_dest_asset = newest_object(Asset, self.version, hostname=row['dest_hostname'])
            my_dest_asset = add_asset(my_dest_asset, self.version, ['hostname'])
            my_dest_label = NetworkPortLabel.objects.get(name=row['dest_port'], itmodel=my_dest_asset.itmodel)

            exists_dest = newest_object(
                NetworkPort, self.version, asset__hostname=my_dest_asset.hostname, label=my_dest_label)
            exists_dest = add_network_conn(exists_dest, self.version)
            exists_dest.connection = new_src_network_port
            new_src_network_port.connection = exists_dest
            exists_dest.save()
            new_src_network_port.save()

        else:
            try:
                my_dest_network_port = NetworkPort.objects.get(connection=my_src_network_port)
                my_dest_network_port.connection = None
                my_dest_network_port.save()
            except:
                my_dest_network_port = NetworkPort.objects.get(connection=versioned_object(
                    my_src_network_port, live, NetworkPort.IDENTITY_FIELDS))
                if my_dest_network_port:
                    my_dest_network_port.connection = None
                    my_dest_network_port.save()

            my_src_network_port.connection = None
            my_src_network_port.save()

    def export(self, queryset=None, version_id=0, *args, **kwargs):
        if queryset is None:
            queryset = self.get_queryset()
        for network_connection in queryset:
            src = network_connection
            dest = network_connection.connection
            if dest:
                if src.asset.itmodel.network_ports > dest.asset.itmodel.network_ports:
                    queryset = queryset.exclude(id=src.id)
                elif src.asset.itmodel.network_ports == dest.asset.itmodel.network_ports:
                    if src.asset.asset_number > dest.asset.asset_number:
                        queryset = queryset.exclude(id=src.id)

        version = ChangePlan.objects.get(id=version_id)
        versioned = versioned_queryset(queryset, version, NetworkPort.IDENTITY_FIELDS)
        return super(NetworkPortResource, self).export(versioned, *args, **kwargs)

    def after_export(self, queryset, data, *args, **kwargs):
        del data['version']
