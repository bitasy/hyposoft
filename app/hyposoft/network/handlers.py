from equipment.models import Asset
from .models import NetworkPort


def net_graph(asset_id):
    asset = Asset.objects.get(id=asset_id)
    assets = set()
    for e in asset.networkport_set.select_related('asset'):
        if e.connection:
            assets.add(e.connection.asset)

    edges = NetworkPort.objects.filter(asset__in=assets).distinct()
    two_hops = set()
    two_hops.add(asset)
    for e in edges.select_related('asset'):
        if e and e.connection:
            two_hops.add(e.asset)
            two_hops.add(e.connection.asset)

    def orderedEdge(edge):
        a = edge.asset.id
        b = edge.connection.asset.id
        return min(a, b), max(a, b)

    blade_nodes = []
    blade_edges = []

    def add_asset_blades(asset):
        blades = asset.blade_set.all()
        if blades.exists():
            for blade in blades:
                blade_nodes.append({
                    'id': blade.id,
                    'label': "{}: Slot {}".format(blade.hostname, blade.slot) if blade.hostname else
                             "Slot " + blade.slot + " blade"
                })
                blade_edges.append((asset.id, blade.id))

    add_asset_blades(asset)
    for asset in assets:
        add_asset_blades(asset)

    return {
        'verticies': [{"id": asset.id, "label": str(asset)} for asset in two_hops] + blade_nodes,
        'edges': set([orderedEdge(edge) for edge in edges if edge.connection] + blade_edges)
    }
