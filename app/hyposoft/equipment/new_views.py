from rest_framework import generics
from .serializers import *
from .models import *


class ITModelCreate(generics.CreateAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer
