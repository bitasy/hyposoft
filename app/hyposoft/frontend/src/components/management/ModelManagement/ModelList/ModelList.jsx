import React from "react";
import styled from "styled-components";
import { Table, Pagination } from "antd";
import ModelListFooter from "./ModelListFooter";
import ModelFilters from "./ModelFilters";
import { useHistory } from "react-router-dom";
import { getModelList } from "../../../../api/model";

const ModelTable = styled(Table)`
  :hover {
    cursor: pointer;
  }
`;

const modelColumns = [
  {
    title: "Vendor",
    dataIndex: "vendor",
    sorter: true,
    sortDirections: ["ascend", "descend"],
  },
  {
    title: "Model #",
    dataIndex: "model_number",
    sorter: true,
    sortDirections: ["ascend", "descend"],
  },
  {
    title: "Height",
    dataIndex: "height",
    sorter: true,
    sortDirections: ["ascend", "descend"],
  },
  {
    title: "Display Color",
    dataIndex: "display_color",
    sorter: true,
    sortDirections: ["ascend", "descend"],
  },
  {
    title: "Network Ports",
    dataIndex: "network_ports",
    sorter: true,
    sortDirections: ["ascend", "descend"],
  },
  {
    title: "Power Ports",
    dataIndex: "power_ports",
    sorter: true,
    sortDirections: ["ascend", "descend"],
  },
  {
    title: "CPU",
    dataIndex: "cpu",
    sorter: true,
    sortDirections: ["ascend", "descend"],
  },
  {
    title: "Memory",
    dataIndex: "memory",
    sorter: true,
    sortDirections: ["ascend", "descend"],
  },
  {
    title: "Storage",
    dataIndex: "storage",
    sorter: true,
    sortDirections: ["ascend", "descend"],
  },
];

const initialFilterValues = {
  search: "",
  height: [1, 42],
  network_ports: [0, 100],
  power_ports: [0, 10],
};

// noCreate?: boolean

function ModelList({ noCreate }) {
  const history = useHistory();

  const [filterValues, setFilterValues] = React.useState(
    initialFilterValues,
  );
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [data, setData] = React.useState([]);
  const [ordering, setOrdering] = React.useState(undefined);
  const [direction, setDirection] = React.useState(
    undefined,
  );

  const realm = React.useRef(0);

  React.useEffect(() => {
    realm.current++;
    const t = realm.current;

    getModelList({
      search: filterValues.search,
      page,
      page_size: pageSize,
      height_min: filterValues.height[0],
      height_max: filterValues.height[1],
      network_port_min: filterValues.network_ports[0],
      network_port_max: filterValues.network_ports[1],
      power_port_min: filterValues.power_ports[0],
      power_port_max: filterValues.power_ports[1],
      ordering,
      direction,
    }).then(r => {
      if (t === realm.current) {
        setData(r.results);
        setTotal(r.count);
      }
    });
  }, [filterValues, page, pageSize, ordering, direction]);

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
    const onClick = () => history.push(`/models/${r.id}`);
    return { onClick };
  }

  return (
    <>
      <ModelFilters
        initialFilterValues={initialFilterValues}
        onChange={setFilterValues}
      />
      <Pagination
        {...paginationConfig}
        style={{ margin: "8px 0" }}
      />
      <ModelTable
        rowKey={r => r.id}
        columns={modelColumns}
        dataSource={data}
        onRow={onRow}
        onChange={onChange}
        pagination={false}
        footer={() => (noCreate ? null : ModelListFooter())}
      />
    </>
  );
}

export default ModelList;
