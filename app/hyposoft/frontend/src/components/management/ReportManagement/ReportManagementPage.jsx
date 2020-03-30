import React from "react";
import { Typography } from "antd";
import { Table } from "antd";
import { getRackUsage } from "../../../api/report";

function processRow({ category, used, free }) {
  return {
    category,
    used: used * 100 * toFixed(2),
    free: free * 100 * toFixed(2),
  };
}

function ReportManagementPage() {
  const [report, setReport] = React.useState(null);
  React.useEffect(() => {
    getRackUsage().then(usage =>
      setReport(
        Object.entries(usage).reduce((acc, [k, v]) => {
          acc[k] = v.map(processRow);
        }, {}),
      ),
    );
  }, []);

  const columns = [
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "% Used",
      dataIndex: "used",
      key: "used",
    },
    {
      title: "% Free",
      dataIndex: "free",
      key: "free",
    },
  ];

  return (
    report != null && (
      <div style={{ padding: 16 }}>
        <Typography.Title level={3}>
          Reports
        </Typography.Title>
        <div>
          <Typography.Title level={4}>
            Total Rack Usage
          </Typography.Title>
          <Table
            dataSource={report.total}
            columns={columns}
          />
          ;
        </div>
        <div>
          <Typography.Title level={4}>
            Rack Usage by Model
          </Typography.Title>
          <Table
            dataSource={report.by_model}
            columns={columns}
          />
        </div>
        <div>
          <Typography.Title level={4}>
            Rack Usage by Owner
          </Typography.Title>
          <Table
            dataSource={report.by_owner}
            columns={columns}
          />
        </div>
        <div>
          <Typography.Title level={4}>
            Rack Usage by Vendor
          </Typography.Title>
          <Table
            dataSource={report.by_vendor}
            columns={columns}
          />
          ;
        </div>
      </div>
    )
  );
}

export default ReportManagementPage;