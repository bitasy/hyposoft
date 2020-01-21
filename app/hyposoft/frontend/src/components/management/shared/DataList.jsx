import React from "react";
import { Table, Button, Icon } from "antd";

function decorateColumns(columns) {
  return columns.map(column => {
    return {
      ...column,
      render: (txt, record, idx) => <span>{column.toString(record)}</span>
    };
  });
}

function ListFooter({ onCreate }) {
  return (
    <div>
      <Button onClick={onCreate}>
        <Icon type="plus"></Icon>
      </Button>
    </div>
  );
}

function DataList({ columns, data, onSelect, onCreate }) {
  const paginationConfig = {
    position: "top",
    defaultPageSize: 10,
    total: data.length
  };

  return (
    <Table
      rowKey={r => r.id}
      columns={decorateColumns(columns)}
      dataSource={data}
      onRow={r => {
        return {
          onClick: () => onSelect(r.id)
        };
      }}
      pagination={paginationConfig}
      className="pointer-on-hover"
      footer={() => ListFooter({ onCreate })}
    />
  );
}

export default DataList;
