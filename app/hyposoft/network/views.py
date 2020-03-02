from rest_framework import views
from rest_framework.decorators import api_view
from rest_framework.response import Response

from equipment.models import Datacenter, Asset
from equipment.serializers import AssetSerializer
from .serializers import NetworkPortLabelSerializer
from .models import NetworkPort


def getNetworkPorts(datacenter_id, filter):
    dc = Datacenter.objects.filter(id=datacenter_id).first()
    if dc:
        assets = Asset.objects.filter(datacenter=dc.id)
        asset_ids = [a.id for a in assets]
        free_network_ports = [
            {
                "id": network_port.id,
                "label": NetworkPortLabelSerializer(instance=network_port.label).data,
                "asset": network_port.asset.id,
                "asset_str": str(network_port.asset)
            }
            for network_port
            in NetworkPort.objects.filter(asset_id__in=asset_ids, **filter)
        ]
        return Response(free_network_ports)
    else:
        return Response([])


class AllNetworkPorts(views.APIView):
    def get(self, request, datacenter_id):
        return getNetworkPorts(datacenter_id, {})


class FreeNetworkPorts(views.APIView):
    def get(self, request, datacenter_id):
        return getNetworkPorts(datacenter_id, { "connection": None })



class NetworkPortDeleteByAsset(views.APIView):
    def delete(self, request, asset_id):
        NetworkPort.objects.filter(asset=asset_id).delete()
        return Response()


@api_view()
def net_graph(request, asset_id):
    asset = Asset.objects.get(id=asset_id)
    assets = set()
    for e in asset.networkport_set.select_related('asset'):
        if e.connection:
            assets.add(e.connection.asset)

    edges = NetworkPort.objects.filter(asset__in=assets).distinct()
    two_hops = set()
    for e in edges.select_related('asset'):
        if e and e.connection:
            two_hops.add(e.asset)
            two_hops.add(e.connection.asset)


    def orderedEdge(edge):
        a = edge.asset.id
        b = edge.connection.asset.id
        return (min(a, b), max(a, b))

    return Response({
        'verticies': [AssetSerializer(data).data for data in two_hops],
        'edges': set([orderedEdge(edge) for edge in edges if edge.connection])
    })
