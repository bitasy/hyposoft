from import_export import resources
from import_export.admin import ImportExportModelAdmin
from import_export.fields import Field
from django.contrib import admin
from .models import ITModel, Instance


class ITModelResource(resources.ModelResource):
    # vendor– required always; string
    # modelnumber– required always; string
    # height– required for new models, optional when modifying existing models; positiveinteger; refers to the height in U of the model
    # displaycolor– optional; 6-digit, 3-byte hex triplet (RGB) preceded by a pound sign(#); e.g.#7FFFD4
    # ethernetports– optional; non-negative integer
    # powerports– optional; non-negative integer
    # cpu– optional; string
    # memory– optional; non-negative integer
    # storage– optional; string
    # comment– optional; string; must be enclosed by double quotes if value contains linebreaks
    model_number = Field(column_name='modelnumber')
    display_color = Field(column_name='displaycolor')
    ethernet_ports = Field(column_name='ethernetports')
    power_ports = Field(column_name='powerports')

    class Meta:
        model = ITModel
        fields = ('vendor', 'model_number', 'height', 'display_color', 'ethernet_ports',
                  'power_ports', 'cpu', 'memory', 'storage', 'comment')
        export_order = ('vendor', 'model_number', 'height', 'display_color', 'ethernet_ports',
                        'power_ports', 'cpu', 'memory', 'storage', 'comment')
        skip_unchanged = True
        report_skipped = False


class ITModelAdmin(ImportExportModelAdmin):
    resource_class = ITModel

    
@admin.site.register(ITModel, ITModelAdmin)


class InstanceModelResource(resources.ModelResource):
    # hostname– required always; RFC-1034-compliant string
    # rack– required for new instances, optional when modifying existing instances; string;the address of a rack is by a row letter (A-Z) and rack number (positive integer); thereis no separator between the row letter and rack number
    # rackposition–  required  for  new  instances,  optional  when  modifying  existing  in-stances; positive integer; refers to the vertical location (on a rack, measured in U) ofthe bottom of the equipment
    # vendor–  required  for  new  instances,  optional  when  modifying  existing  instances;string; refers to the vendor of the model with which this instance is associated
    # modelnumber–  required  for  new  instances,  optional  when  modifying  existing  in-stances;  string;  refers to the model number of the model with which this instance isassociated
    # owner– optional; string; refers to the username of an existing user in the system whoowns this equipment
    # comment– optional; string; must be enclosed by double quotes if value contains linebreaks
    rack_u = Field(column_name='rackposition')
    # FIX: How to map to foreign kep fields?

    class Meta:
        model = Instance
        fields = ('itmodel', 'hostname', 'rack', 'rack_u', 'owner', 'comment')
        export_order = ('hostname', 'rack', 'rack_u', 'itmodel.vendor', 'itmodel.model_number', 'owner', 'comment')
        skip_unchanged = True
        report_skipped = False


@admin.register(Instance)
class InstanceAdmin(ImportExportModelAdmin):
    pass

