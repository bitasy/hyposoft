import React from "react";

import { Typography, Button, Icon, Row, Col } from "antd";
import { useHistory } from "react-router-dom";
import API from "../../../api/API";

function OverviewPage() {
  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Overview</Typography.Title>
      <Row gutter={[16, 16]} type="flex" justify="center">
        {overviewSchema.map((b, idx) => (
          <Col key={idx}>
            <NavCard {...b} />
          </Col>
        ))}
      </Row>
    </div>
  );
}

function NavCard({ entity, link, iconType, fetchStats, size }) {
  const history = useHistory();

  const [stats, setStats] = React.useState(null);

  React.useEffect(() => {
    fetchStats().then(setStats);
  }, []);

  return (
    <Button
      onClick={() => history.push(link)}
      style={{ width: size, height: size }}
    >
      <Icon
        type={iconType}
        style={{ fontSize: `${size / 2}px`, display: "block" }}
      />
      <span style={{ margin: 0, fontSize: `${size / 10}px` }}>
        {stats || ""} {entity}
      </span>
    </Button>
  );
}

function length(arr) {
  return arr.length;
}

const overviewSchema = [
  {
    entity: "Models",
    link: "/models",
    iconType: "inbox",
    size: 250,
    fetchStats: () => API.getModels().then(length)
  },
  {
    entity: "Instances",
    link: "/instances",
    iconType: "database",
    size: 250,
    fetchStats: () => API.getInstances().then(length)
  },
  {
    entity: "Racks",
    link: "/racks",
    iconType: "table",
    size: 250,
    fetchStats: () => API.getRacks().then(length)
  }
];

export default OverviewPage;
