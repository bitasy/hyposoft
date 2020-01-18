import React from "react";
import { Table } from "antd";

function makeColumns(schema) {
  return schema
    .filter(schemaFrag => schemaFrag.required)
    .map(schemaFrag => {
      return {
        title: schemaFrag.displayName,
        dataIndex: schemaFrag.fieldName,
        sorter: schemaFrag.sorter,
        defaultSortOrder: schemaFrag.defaultSortOrder,
        sortDirections: schemaFrag.sortDirections,
        render: (txt, record, idx) => (
          <span>{schemaFrag.toString(record[schemaFrag.fieldName])}</span>
        )
      };
    });
}

function DataList({ schema, data, onSelect }) {
  const paginationConfig = {
    position: "top",
    defaultPageSize: 10,
    total: data.length
  };

  return (
    <Table
      rowKey="id"
      columns={makeColumns(schema)}
      dataSource={data}
      onRow={r => {
        return {
          onClick: () => onSelect(r.id)
        };
      }}
      pagination={paginationConfig}
      className="pointer-on-hover"
    />
  );
}

export default DataList;
