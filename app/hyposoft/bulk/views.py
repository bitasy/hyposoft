from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, serializers, filters, renderers
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from tablib import Dataset

import io

from django.db import models

from equipment.resources import ITModelResource, AssetResource
from equipment.models import ITModel, Asset
from equipment.filters import ITModelFilter, RackRangeFilter, AssetFilter
from equipment.serializers import ITModelSerializer, AssetSerializer
from changeplan.models import ChangePlan
from network.models import NetworkPort
from network.resources import NetworkPortResource


# The Model and Serializer classes are used for compatibility with the browsable API
from hyposoft.utils import get_version


class File(models.Model):
    file = models.FileField(blank=False, null=False)


class FileSerializer(serializers.Serializer):
    file = serializers.FileField()


def bool(obj):
    if type(obj) == bool:
        return obj
    return bool == "true" or bool == "True"


class ITModelImport(generics.CreateAPIView):
    queryset = ITModel.objects.filter(id=-1)
    serializer_class = FileSerializer

    def post(self, request, *args, **kwargs):
        data = request.data
        force = bool(request.query_params['force'])
        file = data.get('file')
        with io.TextIOWrapper(file, encoding='utf-8-sig') as text:
            dataset = Dataset().load(text, format="csv")
            if not dataset.headers == ['vendor', 'model_number', 'height', 'display_color', 'network_ports',
                                       'power_ports', 'cpu', 'memory', 'storage', 'comment', 'network_port_name_1',
                                       'network_port_name_2', 'network_port_name_3', 'network_port_name_4']:
                raise serializers.ValidationError("Improperly formatted CSV")

            result = ITModelResource(
                get_version(request), request.user, True).import_data(dataset, dry_run=not force)

            errors = [
                {"row": row.errors[0].row, "errors": [str(error.error) for error in row.errors]}
                for row in result.rows if len(row.errors) > 0
            ]

            if len(errors) > 0:
                response = {"status": "error", "errors": errors}
            else:
                response = {
                    "status": "diff" if not force else "success",
                    "diff": {"headers": result.diff_headers, "data": [row.diff for row in result.rows]}}
            return Response({response}, HTTP_200_OK)


class AssetImport(generics.CreateAPIView):
    queryset = Asset.objects.filter(id=-1)
    serializer_class = FileSerializer

    def post(self, request, *args, **kwargs):
        data = request.data
        force = bool(request.query_params['force'])
        file = data.get('file')
        with io.TextIOWrapper(file, encoding='utf-8-sig') as text:
            dataset = Dataset().load(text, format="csv")
            if not dataset.headers == ['asset_number', 'datacenter', 'hostname', 'rack', 'rack_position',
                                       'vendor', 'model_number', 'owner', 'comment',
                                       'power_port_connection_1', 'power_port_connection_2']:
                raise serializers.ValidationError("Improperly formatted CSV")

            result = AssetResource(
                get_version(request), request.user, True).import_data(dataset, dry_run=not force)

            errors = [
                {"row": row.errors[0].row, "errors": [str(error.error) for error in row.errors]}
                for row in result.rows if len(row.errors) > 0
            ]

            if len(errors) > 0:
                return Response({"status": "error", "errors": errors}, HTTP_200_OK)
            elif not force:
                resource = AssetResource(get_version(request), request.user, False)
                result = resource.import_data(dataset)

                try:
                    changeplan = ChangePlan.objects.get(owner=request.user, name="_BULK_IMPORT_" + str(id(resource)))
                except ChangePlan.DoesNotExist:
                    # No changes, all objects skipped
                    return Response({}, status=HTTP_200_OK)

                assert(not result.has_errors())

                #todo calculate diff
            else:
                return Response({}, status=HTTP_200_OK)


class NetworkImport(generics.CreateAPIView):
    queryset = NetworkPort.objects.filter(id=-1)
    serializer_class = FileSerializer

    def post(self, request, *args, **kwargs):
        data = request.data
        file = data.get('file')
        with io.TextIOWrapper(file, encoding='utf-8-sig') as text:
            dataset = Dataset().load(text, format="csv")
            if not dataset.headers == ['src_hostname', 'src_port', 'src_mac', 'dest_hostname', 'dest_port']:
                raise serializers.ValidationError("Improperly formatted CSV")
            NetworkPortResource(get_version(request), request.user, request.query_params['force']).import_data(dataset)
            return Response({}, HTTP_200_OK)


class CSVRenderer(renderers.BaseRenderer):
    media_type = "application/octet-stream"
    format = "txt"
    charset = "utf-8-sig"

    def render(self, data, accepted_media_type=None, renderer_context=None):
        return data.export('csv')


class ITModelExport(generics.ListAPIView):
    renderer_classes = [CSVRenderer]

    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = [
        'vendor',
        'model_number',
        'cpu',
        'storage',
        'comment'
    ]

    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer
    filterset_class = ITModelFilter

    def get(self, request, *args, **kwargs):
        data = ITModelResource(get_version(request), request.user)\
            .export(queryset=self.filter_queryset(self.get_queryset()))
        return Response(data, HTTP_200_OK)


class AssetExport(generics.ListAPIView):
    renderer_classes = [CSVRenderer]

    filter_backends = [
        filters.SearchFilter,
        DjangoFilterBackend,
        filters.OrderingFilter,
        RackRangeFilter
    ]
    search_fields = [
        'itmodel__vendor',
        'itmodel__model_number',
        'hostname',
        'owner__username',
        'owner__first_name',
        'owner__last_name',
        'asset_number'
    ]

    def get_queryset(self):
        return Asset.objects.filter(
            commissioned=Asset.Decommissioned.COMMISSIONED,
            version_id=get_version(self.request))
    serializer_class = AssetSerializer
    filterset_class = AssetFilter

    def get(self, request, *args, **kwargs):
        data = AssetResource(get_version(request), request.user)\
            .export(queryset=self.filter_queryset(self.get_queryset()))
        return Response(data, HTTP_200_OK)


class NetworkExport(generics.ListAPIView):
    renderer_classes = [CSVRenderer]

    filter_backends = [
        filters.SearchFilter,
        DjangoFilterBackend,
        filters.OrderingFilter,
        RackRangeFilter
    ]
    search_fields = [
        'itmodel__vendor',
        'itmodel__model_number',
        'hostname',
        'owner__username',
        'owner__first_name',
        'owner__last_name',
        'asset_number'
    ]

    def get_queryset(self):
        return Asset.objects.filter(
            commissioned=Asset.Decommissioned.COMMISSIONED,
            version_id=get_version(self.request))
    serializer_class = AssetSerializer
    filterset_class = AssetFilter

    def get(self, request, *args, **kwargs):
        data = NetworkPortResource(get_version(request), request.user).export(queryset=
            NetworkPort.objects.filter(asset__in=self.filter_queryset(self.get_queryset()))
        )
        return Response(data, HTTP_200_OK)
