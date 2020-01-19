import React from "react";
import { Table, Button, Icon } from "antd";

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

function ListFooter({ onCreate }) {
  return (
    <div>
      <Button onClick={onCreate}>
        <Icon type="plus"></Icon>
      </Button>
    </div>
  );
}

function DataList({ schema, data, onSelect, onCreate }) {
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
      footer={() => ListFooter({ onCreate })}
    />
  );
}

export default DataList;
