import React from "react";
import styled from "styled-components";
<<<<<<< HEAD
import { Table, Pagination, Button, Checkbox} from "antd";
=======
import { Table, Pagination, Button, Row, Col } from "antd";
>>>>>>> dev
import { useHistory } from "react-router-dom";
import AssetListFooter from "./AssetListFooter";
import NetworkPowerActionButtons from "../NetworkPowerActionButtons";
import AssetFilters from "./AssetFilters";
import { getAssetList } from "../../../../api/asset";
import { DCContext } from "../../../../contexts/contexts";
import { exportAssets, exportNetwork } from "../../../../api/bulk";
import VSpace from "../../../utility/VSpace";

const AssetTable = styled(Table)`
  :hover {
    cursor: pointer;
  }
`;

export const assetColumns = [
  {
    title: "Model",
    dataIndex: "model",
    sorter: true,
    sortdirections: ["ascend", "descend"],
  },
  {
    title: "Host",
    dataIndex: "hostname",
    sorter: true,
    sortDirections: ["ascend", "descend"],
  },
  {
    title: "Location",
    dataIndex: "location",
    sorter: true,
    sortDirections: ["ascend", "descend"],
  },
  {
    title: "Owner",
    dataIndex: "owner",
    sorter: true,
    sortDirections: ["ascend", "descend"],
  },
  {
    title: "Power",
    key: "actions",
    sorter: false,
    render: r => {
      return (
        r.power_action_visible && <NetworkPowerActionButtons asset={r.id} />
      );
    },
  },
];

const initialFilterValues = {
  search: "",
  rack_from: "A01",
  rack_to: "Z99",
  rack_position: [1, 42],
};

const selectedRowKeys = [];

// modelID?: number
function AssetList({ modelID }) {
  const history = useHistory();

  const { datacenter } = React.useContext(DCContext);

  const [filterValues, setFilterValues] = React.useState(initialFilterValues);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [total, setTotal] = React.useState(0);
  const [data, setData] = React.useState([]);
  const [ordering, setOrdering] = React.useState(undefined);
  const [direction, setDirection] = React.useState(undefined);

  const [selected] = React.useState(selectedRowKeys);

  const realm = React.useRef(0);

  const assetQuery = {
    search: filterValues.search,
    page,
    page_size: pageSize,
    itmodel: modelID,
    rack_from: filterValues.rack_from,
    rack_to: filterValues.rack_to,
    rack_position_min: filterValues.rack_position[0],
    rack_position_max: filterValues.rack_position[1],
    ordering,
    direction,
  };

  React.useEffect(() => {
    realm.current++;
    const t = realm.current;

    getAssetList(assetQuery).then(r => {
      if (t === realm.current) {
        setData(r.results);
        setTotal(r.count);
      }
    });
  }, [filterValues, page, pageSize, ordering, direction, datacenter?.id]);

  React.useEffect(() => {
    setPage(1);
  }, [filterValues, ordering, direction]);

  const paginationConfig = {
    position: "top",
    total,
    pageSize,
    current: page,
    onChange: (page, pageSize) => {
      setPage(page);
      setPageSize(pageSize);
    },
  };

  function onChange(p, f, sorters) {
    const { column, order } = sorters;
    if (order) {
      setDirection(
        order === "ascend"
          ? "ascending"
          : order === "descend"
          ? "descending"
          : undefined,
      );
      setOrdering(column.dataIndex);
    } else {
      setOrdering(undefined);
    }
  }

  function onRow(r) {
    const onClick = () => history.push(`/assets/${r.id}`);
    return { onClick };
  }

<<<<<<< HEAD
  //TODO: a function to add selected rows to an array
  function onSelectChange(r) {
    const onClick = () => selectedRowKeys.concat(`${r.id}`);
    console.log(selectedRowKeys); //testing
    return { onClick };
  }

  //TODO: define rowSelection
  const rowSelection = {
    selectedRowKeys,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
    ],
//    onChange: onSelectChange(),
//    onSelect:
    //onSelectAll:

  }


=======
  function handleAssetExport() {
    exportAssets(assetQuery);
  }

  function handleNetworkExport() {
    exportNetwork(assetQuery);
  }

>>>>>>> dev
  return (
    <>
      {modelID == null && (
        <div>
          <AssetFilters
            initialFilterValues={initialFilterValues}
            onChange={setFilterValues}
          />
          <VSpace height="8px" />
          <Button
            onClick={() => history.push("/import/asset")}
            style={{ marginRight: 8 }}
          >
            Import Assets
          </Button>
          <Button onClick={handleAssetExport}>Export Assets</Button>
          <VSpace height="8px" />
          <Button
            onClick={() => history.push("/import/network")}
            style={{ marginRight: 8 }}
          >
            Import Network
          </Button>
          <Button onClick={handleNetworkExport}>Export Network</Button>
          <VSpace height="8px" />
        </div>
      )}
      <Pagination {...paginationConfig} style={{ margin: "8px 0" }} />

      <AssetTable
        rowSelection={rowSelection}
        rowKey={r => r.id}
        columns={assetColumns}
        dataSource={data}
        onRow={onRow}
        onChange={onChange}
        pagination={false}
        footer={() => (modelID ? null : AssetListFooter())}
      />
    </>
  );
}

export default AssetList;
