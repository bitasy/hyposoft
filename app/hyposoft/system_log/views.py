from django_filters import rest_framework as pkg_filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, filters

from rest_framework import generics
from rest_framework.pagination import PageNumberPagination

import copy

from .serializers import LogSerializer
from .models import ActionLog, display_name, username
from rest_framework.mixins import CreateModelMixin, UpdateModelMixin, DestroyModelMixin
from django.forms.models import model_to_dict


def create_dict(self, action, instance_id):
    d = {
        'action': action,
        'username': username(self.request.user),
        'display_name': display_name(self.request.user)
        if self.request.user.is_authenticated else "Anonymous User",
        'model': self.serializer_class.Meta.model.__name__, 'instance_id': instance_id}
    return d


class CreateAndLogMixin(CreateModelMixin):
    def perform_create(self, serializer):
        super(CreateAndLogMixin, self).perform_create(serializer)
        entry = ActionLog.objects.create(
            **create_dict(self, ActionLog.Action.CREATE, serializer.data['id'])
        )
        entry.save()


class UpdateAndLogMixin(UpdateModelMixin):
    def perform_update(self, serializer):
        diffs = []
        old = model_to_dict(serializer.instance)
        super(UpdateAndLogMixin, self).perform_update(serializer) ## Move all the above stuff to out here, use actual model for new
        new = model_to_dict(serializer.Meta.model.objects.get(id=old['id']))
        for key in new:
            if key == 'comment':
                continue
            if key in old and new[key] != old[key]:
                diffs.append((key, old[key], new[key]))
        entries = []
        for diff in diffs:
            entries.append(ActionLog.objects.create(
                **create_dict(self, ActionLog.Action.UPDATE, old['id']),
                field_changed=diff[0],
                old_value=str(diff[1]),
                new_value=str(diff[2])
            ))
        for entry in entries:
            entry.save()


class DeleteAndLogMixin(DestroyModelMixin):
    def perform_destroy(self, instance):
        entry = ActionLog.objects.create(
            **create_dict(self, ActionLog.Action.DESTROY, instance.id),
        )
        super(DeleteAndLogMixin, self).perform_destroy(instance)
        entry.save()


class LogView(generics.ListAPIView):

    queryset = ActionLog.objects.all()
    serializer_class = LogSerializer

    # class TempPag(PageNumberPagination):
    #     page_size = 5


    # pagination_class = TempPag


    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = [
        'timestamp'
    ]
    ordering = ['-timestamp']

    class LogFilter(pkg_filters.FilterSet):
        username = pkg_filters.CharFilter()
        display_name = pkg_filters.CharFilter()
        model = pkg_filters.CharFilter()

        class Meta:
            model = ActionLog
            fields = ['username', 'display_name', 'model']

    filterset_class = LogFilter
