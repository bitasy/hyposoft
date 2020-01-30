import React from "react";

import { Typography, Button, Icon, Row, Col } from "antd";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchInstances,
  fetchModels,
  fetchRacks
} from "../../../redux/actions";

function OverviewPage() {
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(fetchModels());
    dispatch(fetchInstances());
    dispatch(fetchRacks());
  }, []);

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

function NavCard({ entity, link, iconType, statSelector, size }) {
  const history = useHistory();

  const stats = useSelector(statSelector);

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

const overviewSchema = [
  {
    entity: "Models",
    link: "/models",
    iconType: "inbox",
    size: 250,
    statSelector: s => Object.keys(s.models).length
  },
  {
    entity: "Instances",
    link: "/instances",
    iconType: "database",
    size: 250,
    statSelector: s => Object.keys(s.instances).length
  },
  {
    entity: "Racks",
    link: "/racks",
    iconType: "table",
    size: 250,
    statSelector: s => Object.keys(s.racks).length
  }
];

export default OverviewPage;
