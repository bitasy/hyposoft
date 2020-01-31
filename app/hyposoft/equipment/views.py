from django.contrib.auth.decorators import permission_required
from django.shortcuts import render
from rest_framework import generics
from .models import ITModel, Instance, Rack
from .serializers import ITModelSerializer, InstanceSerializer, RackSerializer
from django.http import HttpResponse
from .resources import ITModelResource, InstanceResource
from tablib import Dataset


# ITModel
@permission_required('admin.can_add_log_entry')
def itmodel_import(request):
    if request.method == 'POST':
        itmodel_resource = ITModelResource()
        dataset = Dataset()
        new_itmodels = request.FILES['myfile']
        dataset.load(new_itmodels.read())
        result = itmodel_resource.import_data(dataset, dry_run=True)  # Test the data import
        if not result.has_errors():
            itmodel_resource.import_data(dataset, dry_run=False)  # Actually import now
    return render(request, 'core/simple_upload.html')


@permission_required('admin.can_add_log_entry')
def itmodel_export(request):
    itmodel_resource = ITModelResource()
    dataset = itmodel_resource.export()
    response = HttpResponse(dataset.csv, content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="itmodels.csv"'
    return response


class ITModelCreateView(generics.CreateAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer


class ITModelRetrieveView(generics.RetrieveAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer


class ITModelUpdateView(generics.UpdateAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer


class ITModelDestroyView(generics.DestroyAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer


class ITModelListView(generics.ListAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer


# Instance
@permission_required('admin.can_add_log_entry')
def instance_import(request):
    if request.method == 'POST':
        instance_resource = InstanceResource()
        dataset = Dataset()
        new_instances = request.FILES['myfile']
        dataset.load(new_instances.read())
        result = instance_resource.import_data(dataset, dry_run=True)  # Test the data import
        if not result.has_errors():
            instance_resource.import_data(dataset, dry_run=False)  # Actually import now
    return render(request, 'core/simple_upload.html')


@permission_required('admin.can_add_log_entry')
def instance_export(request):
    instance_resource = InstanceResource()
    dataset = instance_resource.export()
    response = HttpResponse(dataset.csv, content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="instances.csv"'
    return response


class InstanceCreateView(generics.CreateAPIView):
    queryset = Instance.objects.all()
    serializer_class = InstanceSerializer


class InstanceRetrieveView(generics.RetrieveAPIView):
    queryset = Instance.objects.all()
    serializer_class = InstanceSerializer


class InstanceUpdateView(generics.UpdateAPIView):
    queryset = Instance.objects.all()
    serializer_class = InstanceSerializer


class InstanceDestroyView(generics.DestroyAPIView):
    queryset = Instance.objects.all()
    serializer_class = InstanceSerializer


class InstanceListView(generics.ListAPIView):
    queryset = Instance.objects.all()
    serializer_class = InstanceSerializer


# Rack
class RackCreateView(generics.CreateAPIView):
    queryset = Rack.objects.all()
    serializer_class = RackSerializer


class RackRetrieveView(generics.RetrieveAPIView):
    queryset = Rack.objects.all()
    serializer_class = RackSerializer


class RackUpdateView(generics.UpdateAPIView):
    queryset = Rack.objects.all()
    serializer_class = RackSerializer


class RackDestroyView(generics.DestroyAPIView):
    queryset = Rack.objects.all()
    serializer_class = RackSerializer


class RackListView(generics.ListAPIView):
    queryset = Rack.objects.all()
    serializer_class = RackSerializer





