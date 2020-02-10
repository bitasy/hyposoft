from rest_framework import generics
from .serializers import ITModelSerializer, InstanceSerializer, RackSerializer
from .filters import ITModelFilter
from .models import ITModel, Instance, Rack
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend


class ITModelFilterList(generics.ListAPIView):
    """
    Class for returning paginated ITModels after filtering criteria.
    """

    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['vendor', 'model_number', 'cpu', 'storage']

    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer
    filterset_class = ITModelFilter
