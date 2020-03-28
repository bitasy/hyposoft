

# Given a rack row letter, provides the next row letter
# Essentially, after Z is AA and after AA is AB etc.
from django.db.models import Q

from equipment.models import Rack
from network.models import NetworkPort


def next_char(char):
    if len(char) == 1:
        if char < "Z":
            return chr(ord(char) + 1)
        else:
            return "AA"
    else:
        if char[-1] < "Z":
            return char[:-1] + next_char(char[-1])
        else:
            return next_char(char[:-1]) + "A"


# Returns whether rack row1 is greater than rack row2.
# AA is greater than Z, etc. Otherwise, use lexographic comparison.
def greater_than(row1, row2):
    if len(row2) > len(row1):
        return False
    return row1 > row2


def generate_racks(r1, r2, c1, c2):
    r1 = r1.upper()
    r2 = r2.upper()
    if greater_than(r1, r2):
        temp = r1
        r1 = r2
        r2 = temp

    c1 = int(c1)
    c2 = int(c2)

    racks = []

    for c in range(min(c1, c2), max(c1, c2) + 1):
        r = r1
        while True:
            racks.append(r + str(c))
            r = next_char(r)
            if greater_than(r, r2):
                break

    return racks


def get_version(request):
    val = request.META.get('HTTP_X_CHANGE_PLAN', 3)
    return val if isinstance(val, int) else 3


def versioned_object(obj, version, identity_fields):
    if obj.version == version:
        return obj
    obj_list = obj.__class__.objects.filter(id=obj.id).values(*identity_fields)[0]
    if any([v is None for v in obj_list.values()]):
        return None
    return obj.__class__.objects.filter(version=version, **obj_list).first()


def versioned_queryset(queryset, version, identity_fields):
    if version.id == 0:
        return queryset.filter(version=version)
    try:
        versioned = queryset.filter(version=version)
        values = versioned.values_list(*identity_fields)
        q = Q()
        for item in values:
            d = {}
            for i in range(len(identity_fields)):
                d[identity_fields[i]] = item[i]
            q = q | Q(**d)

        # Return all objects in live, except for objects that exist separately in the change plan
        return queryset.filter(version_id=0).exclude(q).union(versioned)

    except:
        return queryset


# For adding various objects from live to a change plan
def add_rack(rack, change_plan):
    rack.id = None
    rack.version = change_plan
    rack.save()
    return rack


def add_asset(asset, change_plan):
    rack = versioned_object(asset.rack, change_plan, Rack.IDENTITY_FIELDS)
    if rack is None:
        rack = add_rack(asset.rack, change_plan)

    asset.id = None
    asset.version = change_plan
    asset.rack = rack
    asset.save()
    return asset


def add_network_conn(connection, version):
    versioned_conn = versioned_object(connection, version, NetworkPort.IDENTITY_FIELDS)
    if versioned_conn is None:
        # Add connected asset to change plan
        conn_asset = connection.asset
        new_asset = add_asset(conn_asset, version)
        connection.id = None
        connection.asset = new_asset
        connection.connection = None
        connection.version = version
        connection.save()
        return connection
    return versioned_conn
