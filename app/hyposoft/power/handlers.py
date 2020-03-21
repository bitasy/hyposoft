import re
import requests
from requests import ConnectTimeout

from .models import Powered

PDU_url = "http://hyposoft-mgt.colab.duke.edu:8008/"
GET_suf = "pdu.php"
POST_suf = "power.php"
rack_pre = "hpdu-rtp1-"


def get_pdu(rack, position):
    try:
        split = re.search(r"\d", rack).start()
        rack = rack[:split] + "0" + rack[split:]
        response = requests.get(PDU_url + GET_suf, params={'pdu': rack_pre + rack + position}, timeout=0.5)
        code = response.status_code
        # The following regex extracts the state of each port on the pdu
        # The format is a list of tuples, e.g. [('1', 'OFF'), ('2', 'ON'), ...]
        result = re.findall(r"<td>(\d{1,2})<td><span style=\'background-color:#[0-9a-f]{3}\'>(ON|OFF)", response.text)
        # If there are no matches, the post failed so return the error text
        if len(result) == 0:
            result = response.text
            code = 400
    except ConnectTimeout:
        return "couldn't connect", 400
    return result, code


def update_asset_power(asset):
    if asset.datacenter.abbr == 'rtp1':
        pdus = asset.pdu_set.all()
        for pdu in pdus:
            states, status_code = get_pdu(pdu.rack.rack, pdu.position)
            if status_code >= 400:
                pdu.networked = False
                continue
            pdu.networked = True
            for state in states:

                try:
                    entry = Powered.objects.filter(asset=asset, pdu=pdu, plug_number=state[0])
                except Powered.DoesNotExist:
                    continue
                entry.update(on=state[1] == 'ON')
