# API specs

## General notes

- This document is never final; Whenever there needs to be changes to the document, feel free to do so.

- There's a difference between `null` and `undefined`.

  `undefined` means that the field might be a string, or not included at all.

  `null` means that the field exists, but just given a null value.

- When the type is `String | null`, treat empty string as `null`.

- The type `XXX_ID` is a foreign key to another model - with a type `int`.

- The type `XXX_STR` is a string that allows an user to distinguish what the object is. It isn't used for any other reason than simply displaying it.

- Most of the APIs, unless stated in its `Notes` section, should be performed in a transactionsal manner - change application state only on success.

  On success, return whatever that's in the `Response Body`.

  On error, return a user-friendly string that fully describes (if multiple, concatenate with `\n`) the error with an appropriate `4XX, 5XX` code.

- Non-transactional APIs should always return 2XX, as warnings and failures are an expected part of the API.

- APIs that are indicated "Datacenter-dependent" in the notes should look for datacenter header and act accordingly.

# Types

```
ITModel {
  id: ITMODEL_ID,
  vendor: string,
  model_number: string,
  height: int,
  power_ports: int,
  network_port_labels: string[]

  display_color: string | null,
  cpu: string | null,
  memory: int | null,
  storage: string | null,
  comment: string | null,
}

Asset {
  id: ASSET_ID,
  asset_number: number,
  hostname: string | null,
  itmodel: ITMODEL_ID,
  datacenter: DATACENTER_ID,
  rack: RACK_ID,
  rack_position: int,
  power_connections: {
    pdu_id: PDU_ID,
    plug: int,
  }[],
  network_ports: {
    id: NETWORK_PORT_ID,
    mac_address: string | null,
    connection: NETWORK_PORT_ID | null,
  }[],
  comment: string | null,
  owner: USER_ID | null,
  power_state: "On" | "Off" | null # null for assets that don't have networked pdus connected to it
}

Rack {
  id: RACK_ID,
  rack: string,
}

Datacenter {
  id: DATACENTER_ID,
  name: string,
  abbr: string,
}

NetworkPort {
  id: NETWORK_PORT_ID,
  label: string,
  mac_address: string | null,
  connection: NETWORK_PORT_ID | null
}

PowerPort {
  pdu_id: PDU_ID,
  plug: int,
  asset_id: ASSET_ID | null,
  label: string, # ex) L1, R2
}

User {
  username: string,
  first_name: string,
  last_name: string,
  is_staff: bool # may be replaced in favor of roles
}

```

# Create APIs

### `[POST] api/equipment/ITModelCreate`

#### Request Body

```
{
  vendor: string,
  model_number: string,
  height: int,
  power_ports: int,
  network_ports_labels: string[],

  display_color: string | null,
  cpu: string | null,
  memory: number | null,
  storage: string | null,
  comment: string | null,
}
```

#### Notes

The necessary `NetworkPort` should be generated on the server.

#### Response Body

```
ITModel
```

### `[POST] api/equipment/AssetCreate`

#### Request Body

```
{
  asset_number: number | null,
  hostname: string | null,
  itmodel: ITMODEL_ID,
  datacenter: DATACENTER_ID,
  rack: RACK_ID,
  rack_position: int,
  power_connections: {
    pdu_id: PDU_ID,
    plug: int,
  }[],
  network_ports: {
    label: string,
    mac_address: string | null,
    connection: NETWORK_PORT_ID | null
  }[],
  comment: string | null,
  owner: USER_ID | null,
}
```

#### Notes

The necessary `Powereds` / `NetworkPort` should (of course, after validation) should be generated.

Since network port labels are unique within an ITModel, `label` field is sufficient to identify and create the network port.

#### Response Body

```
Asset
```

### `[POST] api/equipment/BulkRackCreate`

#### Request Body

```
{
  datacenter: DATACENTER_ID,
  rowIdx: int,
  colIdx: int
}[]
```

#### Notes

> Not transactional.

The indices are 0-based. The necessary `PDU` should be created.

#### Response Body

```
{
  res: Rack | null
  warn: string | null,
  err: string | null,
}[]
```

### `[POST] api/equipment/DatacenterCreate`

#### Request Body

```
{
  abbr: string,
  name: string
}
```

#### Response Body

```
Datacenter
```

# Update APIs

### `[PATCH] api/equipment/ITModelUpdate/:itmodel_id`

#### Request Body

```
{
  vendor: string,
  model_number: string,
  height: int,
  power_ports: int,
  network_ports_labels: string[],

  display_color: string | null,
  cpu: string | null,
  memory: number | null,
  storage: string | null,
  comment: string | null,
}
```

#### Notes

This request should be rejected if there are instances of this ITModel.

#### Response Body

```
ITModel # updated one
```

### `[PATCH] api/equipment/AssetUpdate/:asset_id`

#### Request Body

```
{
  asset_number: number | null,
  hostname: string | null,
  itmodel: ITMODEL_ID,
  datacenter: DATACENTER_ID,
  rack: RACK_ID,
  rack_position: int,
  power_connections: {
    pdu_id: PDU_ID,
    plug: int,
  }[],
  network_ports: {
    id: NETWORK_PORT_ID,
    mac_address: string | null,
    connection: NETWORK_PORT_ID | null,
  }[],
  comment: string | null,
  owner: USER_ID | null,
}
```

#### Response Body

```
Asset # updated one
```

### `[PATCH] api/equipment/DatacenterUpdate/:datacenter_id`

#### Request Body

```
{
  name: string,
  abbr: string,
}
```

#### Response Body

```
Datacenter # updated one
```

# Destroy APIs

### `[DELETE] api/equipment/ITModelDestroy/:itmodel_id`

#### Notes

The request should fail if there are assets of this ITModel.

#### Response Body

```
ITMODEL_ID
```

### `[DELETE] api/equipment/AssetDestory/:asset_id`

#### Response Body

```
ASSET_ID
```

### `[DELETE] api/equipment/BulkRackDestroy`

#### Request Body

```
RACK_ID[]
```

#### Notes

> Not transactional

#### Response Body

```
{
  id: RACK_ID,
  warn: string | null,
  err: string | null,
}[]
```

####

### `[DELETE] api/equipment/DatacenterDestory/:datacenter_id`

#### Response Body

```
DATACENTER_ID
```

# Retrieve APIs

### `[GET] api/equipment/ITModelRetrieve/:itmodel_id`

#### Response Body

```
ITModel
```

### `[GET] api/equipment/AssetRetrieve/:asset_id`

#### Response Body

```
ASSET
```

# List APIs

For all of these APIs, make sure they don't fail - just act as if empty list is returned with 200.

Also, filters with undefined query params shouldn't filter out anything.

### `[GET] api/equipment/ITModelList`

#### Query params

```
{
  search: string | undefined,
  page: int | undefined, # default 1,
  page_size: int | undefined, # default 10
  height_min: number | undefined,
  height_max: number | undefined,
  network_port_min: number | undefined,
  network_port_max: number | undefined,
  power_port_min: number | undefined,
  power_port_max: number | undefined,
  ordering:
    | 'vendor'
    | 'model_number'
    | 'height'
    | 'display_color'
    | 'network_ports'
    | 'power_ports'
    | 'cpu'
    | 'memory'
    | 'storage'
    | undefined, # default 'id'
  direction:
    | 'ascending'
    | 'descending'
    | undefined # default 'descending'
}
```

#### Response body

```
{
  num_pages: int,
  result: ITModelEntry[],
}

where

ITModelEntry {
  id: ITMODEL_ID,
  vendor: string,
  model_number: string,
  height: int,
  display_color: string | null,
  network_ports: int,
  power_ports: int,
  cpu: string | null,
  memory: int | null,
  storage: string | null,
}
```

### `[GET] api/equipment/AssetList`

#### Query params

```
{
  search: string | undefined,
  page: int | undefined, # default 1,
  page_size: int | undefined, # default 10
  rack_from: string | undefined, # ex) A01
  rack_to: string | undefined,
  rack_position_min: int | undefined
  rack_position_max: int | undefined
  ordering:
    | 'model' # combination of vendor / model_number
    | 'hostname'
    | 'location' # combination of datacenter, rack, rack_position
    | 'owner'
    | undefined, # default 'id'
  direction:
    | 'ascending'
    | 'descending'
    | undefined # default 'descending'
}
```

#### Notes

> Datacenter-dependent

`power_action_visible` field in the response can be determined since the request contains the user session.

#### Response body

```
{
  num_pages: int,
  result: AssetEntry[],
}

where

AssetEntry {
  id: ASSET_ID,
  model: string,
  hostname: string,
  location: string,
  owner: string,
  power_action_visible: bool
}
```

### `[GET] api/equipments/AssetList`

#### QueryParams

```
{
  rack_id: RACK_ID | undefined
}
```

#### Response body

```
Asset[]
```

### `[GET] api/equipments/RackList`

#### Notes

> Datacenter-dependent

#### Response body

```
Rack[]
```

### `[GET] api/equipments/DatacenterList`

#### Response body

```
Datacenter[]
```

### `[GET] api/equipments/PowerPortList`

#### Query params

```
{
  rack_id: RACK_ID | undefined
}
```

#### Response body

```
PowerPort[]
```

### `[GET] api/equipments/NetworkPortList`

#### Query params

```
{
  asset_id: ASSET_ID | undefined
}
```

#### Response body

```
NetworkPort[]
```

### `[GET] api/UserList`

#### Response body

```
User[]
```

### `[GET] api/equipments/ITModelPickList`

```
{
  id: MODEL_ID,
  str: MODEL_STR,
}
```

# Log APIs

### `[GET] log`

#### Query params

```
{
  page: int,
  page_size: int,
  username_search: string | undefined,
  display_name_search: string | undefined,
  model_search: string | undefined,
  identifier_search: string | undefined,
  ordering:
    | 'timestamp'
    | undefined # default 'timestamp'
  direction:
    | 'ascending'
    | 'descending'
    | undefined # default 'descending
}
```

# Power Management APIs

### `[GET] api/equipments/PDUNetwork/get/:asset_id`

#### Notes

It's guaranteed that this api will be called only on assets that had `power_state` field set to a non-null field.

#### Response body

```
"On" | "Off" | "Unavailable"
```

### `[POST] api/equipments/PDUNetwork/post`

#### Request body

```
{
  asset_id: ASSET_ID,
  state: "on" | "off"
}
```

#### Response body

```
(empty)
```

### `[POST] api/equipments/PDUNetwork/cycle`

#### Request body

```
{
  asset_id: ASSET_ID
}
```

#### Notes

The response shouldn't be sent until the cycle operation is finished.

#### Response body

```
(empty)
```

# User APIs

### `[GET] auth/current_user`

#### Notes

#### Response body

```
User | null
```

### `[POST] auth/login`

#### Request body

```
{
  username: string,
  password: string,
}
```

#### Response body

```
User
```

### `[POST] auth/logout`

#### Response body

```
(empty)
```

### `[GET] auth/shib_login`

#### Notes

Should redirect to /Shibboleth.sso/Login

# Import / Export APIs

### `[POST] api/import/ITModel`

### `[POST] api/import/Asset`

### `[POST] api/import/Network`

#### Query params

```
{
  force: boolean # when true, ignore warnings
}
```

#### Request body

```
serialized bytestream of the csv file
```

#### Notes

This request should always "succeed" with status code 2XX.

#### Response body

```
{
  headers: string[],
  diff: {
    before: string[] | null,
    after: string[] | null,
    warning: string | null,
    error: string | null,
  }[]
}
```

### `[GET] api/export/ITModel`

### `[GET] api/export/Asset`

### `[GET] api/export/Network`

#### Query params

```
See respective Filter APIs (but without page/page_size/ordering/direction)
Network inherits the filters from Assets - for the exact semantics, see https://piazza.com/class/k4u27qnccr45oo?cid=110
```

#### Response body

```
serialized bytestream of the csv file (make sure that the content-type header is set to 'application/octet-stream' to trigger the download.)
```

####

# Uncategorized APIs

### `[GET] api/equipments/NetworkGraph/:asset_id`

#### Notes

Even if the asset doesn't have any connections, the response should have that asset as a single verticies and no edges.

#### Response body

```
{
  verticies: Asset[],
  edges: [ASSET_ID, ASSET_ID][],
}
```