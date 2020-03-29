import React from "react";
import { Typography, Table, Button } from "antd";
import styled from "styled-components";
import moment from "moment";
import { getChangePlanList } from "../../../api/changeplan";
import { PlusOutlined } from "@ant-design/icons";
import { useHistory } from "react-router-dom";

const CPTable = styled(Table)`
  cursor: pointer;
`;

const cpColumns = [
  {
    title: "name",
    dataIndex: "name",
    sorter: false,
  },
  {
    title: "executed_at",
    key: "executed_at",
    render: (t, r) => {
      return r.executed_at
        ? moment(r.executed_at).format("MMMM Do YYYY, h:mm:ss a")
        : "N/A";
    },
    sorter: false,
  },
  {
    title: "Actions",
    dataIndex: "storage",
    sorter: true,
    sortDirections: ["ascend", "descend"],
  },
];

function ChangePlanList() {
  const history = useHistory();
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    getChangePlanList().then(setData);
  }, []);

  function onRow(r) {
    const onClick = () => history.push(`/changeplan/${r.id}`);
    return { onClick };
  }

  const footer = () => (
    <div>
      <Button onClick={() => history.push("/changeplan/create")}>
        <PlusOutlined />
      </Button>
    </div>
  );

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Change Plans</Typography.Title>
      <CPTable
        rowKey={r => r.id}
        columns={cpColumns}
        dataSource={data}
        onRow={onRow}
        pagination={false}
        footer={footer}
      />
    </div>
  );
}

export default ChangePlanList;
