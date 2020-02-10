from rest_framework import generics
from .serializers import ITModelSerializer, InstanceSerializer, RackSerializer
from .filters import ITModelFilter, InstanceFilter
from .models import ITModel, Instance, Rack
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend


class ITModelFilterView(generics.ListAPIView):
    """
    Class for returning ITModels after filtering criteria.
    """

    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['vendor', 'model_number', 'cpu', 'storage']

    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer
    filterset_class = ITModelFilter

class InstanceFilterView(generics.ListAPIView):
    """
    Class for returning Instances after filtering criteria.
    """

    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = [
        'itmodel__vendor',
        'itmodel__model_number',
        'hostname',
        'owner__username',
        'owner__first_name',
        'owner__last_name'
    ]

    serializer_class = InstanceSerializer
    filterset_class = InstanceFilter

    def get_queryset(self):
        queryset = Instance.objects.all()
        rack_min = self.request.query_params.get("rack_min", None)
        rack_max = self.request.query_params.get("rack_max", None)
        if rack_max is not None and rack_max is not None:
            racks = Rack.objects.in_racks(rack_min, rack_max)
            queryset = queryset.filter(rack__in=racks)

        return queryset
