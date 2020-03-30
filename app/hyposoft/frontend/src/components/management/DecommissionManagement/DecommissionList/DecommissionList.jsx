import React from "react";
import styled from "styled-components";
import { Table, Pagination } from "antd";
import { useHistory } from "react-router-dom";
import AssetFilters from "../../AssetManagement/AssetList/AssetFilters";
import DecommissionFilters from "./DecommissionFilters";
import NetworkPowerActionButtons from "../../AssetManagement/NetworkPowerActionButtons";
import { getDecommissionedAssetList } from "../../../../api/asset";
import { DCContext } from "../../../../contexts/contexts";

const DecommissionTable = styled(Table)`
  :hover {
    cursor: pointer;
  }
`;

export const decommissionColumns = [
  {
    title: "Model",
    dataIndex: "itmodel",
    sorter: true,
    sortDirections: ["ascend", "descend"],
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
    title: "Decommission Owner",
    dataIndex: "decommissioned_by",
    sorter: true,
    sortDirections: ["ascend", "descend"],
  },
  {
    title: "Timestamp",
    dataIndex: "decommissioned_timestamp",
    sorter: true,
    sortDirections: ["ascend", "descend"],
  },
];

const initialFilterValues = {
  search: "",
  timestamp_from: undefined,
  timestamp_to: undefined,
};

// modelID?: number
function DecommissionList({ modelID }) {
  const history = useHistory();

  const { datacenter } = React.useContext(DCContext);

  const [filterValues, setFilterValues] = React.useState(initialFilterValues);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [total, setTotal] = React.useState(0);
  const [data, setData] = React.useState([]);
  const [ordering, setOrdering] = React.useState(undefined);
  const [direction, setDirection] = React.useState(undefined);

  const realm = React.useRef(0);

  React.useEffect(() => {
    realm.current++;
    const t = realm.current;

    getDecommissionedAssetList({
      search: filterValues.search,
      page,
      page_size: pageSize,
      itmodel: modelID,
      timestamp_from: filterValues.timestamp_from,
      timestamp_to: filterValues.timestamp_to,
      owner: filterValues.decommissioned_by,
      decommissioned_timestamp: filterValues.decommissioned_timestamp,
      ordering,
      direction,
      t,
    }).then(r => {
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

  return (
    <>
      {modelID == null && (
        <DecommissionFilters
          initialFilterValues={initialFilterValues}
          onChange={setFilterValues}
        />
      )}
      <Pagination {...paginationConfig} style={{ margin: "8px 0" }} />
      <DecommissionTable
        rowKey={r => r.id}
        columns={decommissionColumns}
        dataSource={data}
        onRow={onRow}
        onChange={onChange}
        pagination={false}
      />
    </>
  );
}

export default DecommissionList;
