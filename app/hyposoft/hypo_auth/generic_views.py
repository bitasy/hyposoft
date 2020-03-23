from rest_framework import generics
from .serializers import PermissionSerializer
from .models import Permission


class PermissionCreateView(generics.CreateAPIView):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer


class PermissionRetrieveView(generics.RetrieveAPIView):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer


class PermissionUpdateView(generics.UpdateAPIView):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer


class PermissionDestroyView(generics.DestroyAPIView):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer


class PermissionListView(generics.ListAPIView):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
