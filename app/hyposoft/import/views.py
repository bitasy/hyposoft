from rest_framework import generics, serializers
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from tablib import Dataset

import io

from django.db import models


# The Model and Serializer classes are used for compatibility with the browsable API
from equipment.resources import ITModelResource, AssetResource
from network.resources import NetworkPortResource


class File(models.Model):
    file = models.FileField(blank=False, null=False)


class FileSerializer(serializers.Serializer):
    file = serializers.FileField()


class ITModelImport(generics.CreateAPIView):
    queryset = None
    serializer_class = FileSerializer

    def post(self, request, *args, **kwargs):
        data = request.data
        file = data.get('file')
        with io.TextIOWrapper(file, encoding='utf-8-sig') as text:
            dataset = Dataset().load(text, format="csv")
            if not dataset.headers == ['vendor', 'model_number', 'height', 'display_color', 'network_ports',
                                       'power_ports', 'cpu', 'memory', 'storage', 'comment', 'network_port_name_1',
                                       'network_port_name_2', 'network_port_name_3', 'network_port_name_4']:
                raise serializers.ValidationError("Improperly formatted CSV")
            result = ITModelResource().import_data(dataset)
            return Response({}, HTTP_200_OK)


class AssetImport(generics.CreateAPIView):
    queryset = None
    serializer_class = FileSerializer

    def post(self, request, *args, **kwargs):
        data = request.data
        file = data.get('file')
        with io.TextIOWrapper(file, encoding='utf-8-sig') as text:
            dataset = Dataset().load(text, format="csv")
            if not dataset.headers == ['asset_number', 'datacenter', 'hostname', 'rack', 'rack_position',
                                       'vendor', 'model_number', 'owner', 'comment',
                                       'power_port_connection_1', 'power_port_connection_2']:
                raise serializers.ValidationError("Improperly formatted CSV")
            result = AssetResource().import_data(dataset)
            return Response({}, HTTP_200_OK)


class NetworkImport(generics.CreateAPIView):
    queryset = None
    serializer_class = FileSerializer

    def post(self, request, *args, **kwargs):
        data = request.data
        file = data.get('file')
        with io.TextIOWrapper(file, encoding='utf-8-sig') as text:
            dataset = Dataset().load(text, format="csv")
            if not dataset.headers == ['src_hostname', 'src_port', 'src_mac', 'dest_hostname', 'dest_port']:
                raise serializers.ValidationError("Improperly formatted CSV")
            result = NetworkPortResource().import_data(dataset)
            return Response({}, HTTP_200_OK)
