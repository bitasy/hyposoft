from rest_framework import views
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK

from equipment.models import Rack
from hyposoft.utils import get_version


class PowerPortList(views.APIView):
    def get(self, request, **kwargs):
        data = []
        version = get_version(request)
        rack = Rack.objects.get(id=request.query_params['rack'], version_id=version)
        for pdu in rack.pdu_set.all():
            for i in range(1, 25):
                asset = pdu.powered_set.filter(plug_number=i).first()
                port = {
                    'pdu_id': pdu.id,
                    'plug': i,
                    'label': pdu.position + str(i),
                    'asset_id': asset.id if asset else None
                }
                data.append(port)
        return Response(data, HTTP_200_OK)
