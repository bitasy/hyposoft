from import_export import resources, fields
from .models import ITModel, Instance
from import_export.fields import Field
from import_export.widgets import ForeignKeyWidget


class ITModelResource(resources.ModelResource):

    class Meta:
        model = ITModel
        exclude = ('id',)
        import_id_fields = ('vendor', 'model_number', 'height', 'display_color', 'ethernet_ports',
                  'power_ports', 'cpu', 'memory', 'storage', 'comment')
        export_order = ('vendor', 'model_number', 'height', 'display_color', 'ethernet_ports',
                        'power_ports', 'cpu', 'memory', 'storage', 'comment')
        skip_unchanged = True
        report_skipped = True
        clean_model_instances = True


class InstanceResource(resources.ModelResource):

    rack_u = Field(column_name='rack_position')
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

    class Meta:
        model = Instance
        exclude = ('id',)
        import_id_fields = ('vendor', 'model_number', 'hostname', 'rack', 'rack_u', 'owner', 'comment')
        export_order = ('hostname', 'rack', 'rack_u', 'vendor', 'model_number', 'owner', 'comment')
        skip_unchanged = True
        report_skipped = True
        clean_model_instances = True
