import React from "react";
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { Layout, Menu, Icon, Col, Button } from "antd";
import Session from "../../contexts/Session";

const { Header, Content, Sider } = Layout;

function ManagementPageFrame({ children }) {
  const session = React.useContext(Session);

  return (
    <Layout>
      <Header style={{ padding: 0 }}>
        <Col lg={12} style={{ paddingLeft: 24 }}>
          <h1 style={{ fontSize: 24, color: "#ddd", marginRight: "auto" }}>
            IT Asset Management System
          </h1>
        </Col>
        <Col lg={12} style={{ paddingRight: 24, textAlign: "right" }}>
          <Button ghost onClick={session.logout}>
            <Icon type="logout" />
            Logout
          </Button>
        </Col>
      </Header>
      <Layout>
        <Sider width={160} theme="light">
          <Sidebar />
        </Sider>
        <Layout style={{ padding: "0 16px 16px" }}>
          <Content style={{ marginTop: 16, backgroundColor: "white" }}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

function Sidebar() {
  const history = useHistory();

  function handleClick(e) {
    history.push(e.key);
  }

  return (
    <Menu onClick={handleClick} selectedKeys={[]} mode="inline">
      <Menu.Item key="/">
        <Icon type="appstore" />
        Overview
      </Menu.Item>

      <Menu.Item key="models">
        <Icon type="inbox" />
        Models
      </Menu.Item>

      <Menu.Item key="/instances">
        <Icon type="database" />
        Instances
      </Menu.Item>

      <Menu.Item key="/tools">
        <Icon type="tool" />
        Tools
      </Menu.Item>

      <Menu.Item key="help">
        <Icon type="question-circle" />
        Help
      </Menu.Item>
    </Menu>
  );
}

ManagementPageFrame.propTypes = {
  children: PropTypes.node
};

ManagementPageFrame.defaultProps = {
  children: null
};

export default ManagementPageFrame;
