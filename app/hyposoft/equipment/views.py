from rest_framework import generics
from .models import ITModel, Instance, Rack
from .serializers import ITModelSerializer, InstanceSerializer, RackSerializer

# CRUD, list views
# ITModel
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