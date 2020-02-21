from django.contrib.auth.models import User
from import_export import resources, fields
from .models import ITModel, Asset, Rack
from import_export.widgets import ForeignKeyWidget


class ITModelResource(resources.ModelResource):

    class Meta:
        model = ITModel
        exclude = ('id',)
        import_id_fields = ('vendor', 'model_number')
        export_order = ('vendor', 'model_number', 'height', 'display_color', 'ethernet_ports',
                        'power_ports', 'cpu', 'memory', 'storage', 'comment')
        skip_unchanged = True
        report_skipped = True
        clean_model_instances = True


class AssetResource(resources.ModelResource):

    rack = fields.Field(
        column_name='rack',
        attribute='rack',
        widget=ForeignKeyWidget(Rack, 'rack')
    )
    vendor = fields.Field(
        column_name='vendor',
        attribute='itmodel',
        widget=ForeignKeyWidget(ITModel, 'vendor')
    )
    model_number = fields.Field(
        column_name='model_number',
        attribute='itmodel',
        widget=ForeignKeyWidget(ITModel, 'model_number')
    )
    owner = fields.Field(
        column_name='owner',
        attribute='owner',
        widget=ForeignKeyWidget(User, 'username')
    )

    class Meta:
        model = Asset
        import_id_fields = ('hostname', 'vendor', 'model_number')
        export_order = ('hostname', 'rack', 'rack_position', 'vendor', 'model_number', 'owner', 'comment')
        exclude = ('id', 'itmodel')
        skip_unchanged = True
        report_skipped = True
        clean_model_instances = True
