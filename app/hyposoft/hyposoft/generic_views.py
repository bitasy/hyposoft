from rest_framework import generics
from .serializers import PermsSerializer
from .models import Perms


# Perms
class PermsCreateView(generics.CreateAPIView):
    queryset = Perms.objects.all()
    serializer_class = PermsSerializer


class PermsRetrieveView(generics.RetrieveAPIView):
    queryset = Perms.objects.all()
    serializer_class = PermsSerializer


class PermsUpdateView(generics.UpdateAPIView):
    queryset = Perms.objects.all()
    serializer_class = PermsSerializer


class PermsDestroyView(generics.DestroyAPIView):
    queryset = Perms.objects.all()
    serializer_class = PermsSerializer


class PermsListView(generics.ListAPIView):
    queryset = Perms.objects.all()
    serializer_class = PermsSerializer
