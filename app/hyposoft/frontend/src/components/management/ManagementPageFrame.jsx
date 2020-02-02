import React from "react";
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { Layout, Menu, Icon, Col, Button } from "antd";
import { logout } from "../../redux/actions";
import { useDispatch } from "react-redux";

const { Header, Content, Sider } = Layout;

function ManagementPageFrame({ children }) {
  const dispatch = useDispatch();

  return (
    <Layout>
      <Header style={{ padding: 0 }}>
        <Col lg={12} style={{ paddingLeft: 24 }}>
          <h1 style={{ fontSize: 24, color: "#ddd", marginRight: "auto" }}>
            IT Asset Management System
          </h1>
        </Col>
        <Col xs={0} lg={12} style={{ paddingRight: 24, textAlign: "right" }}>
          <Button ghost onClick={() => dispatch(logout())}>
            <Icon type="logout" />
            Logout
          </Button>
        </Col>
      </Header>
      <Layout>
        <Sider width={160} theme="light" collapsible>
          <Sidebar />
        </Sider>
        <Layout style={{ padding: "0 16px 16px" }}>
          <Content
            style={{
              marginTop: 16,
              backgroundColor: "white",
              minHeight: "85vh"
            }}
          >
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
        <span>Overview</span>
      </Menu.Item>

      <Menu.Item key="/models">
        <Icon type="inbox" />
        <span>Models</span>
      </Menu.Item>

      <Menu.Item key="/instances">
        <Icon type="database" />
        <span>Instances</span>
      </Menu.Item>

      <Menu.Item key="/racks">
        <Icon type="table" />
        <span>Racks</span>
      </Menu.Item>

      <Menu.Item key="/tools">
        <Icon type="tool" />
        <span>Tools</span>
      </Menu.Item>

      <Menu.Item key="/help">
        <Icon type="question-circle" />
        <span>Help</span>
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
