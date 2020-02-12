import React from "react";
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { Layout, Menu, Icon, Col, Button } from "antd";
import { logout } from "../../redux/actions";
import { useSelector, useDispatch } from "react-redux";

const { Header, Content, Sider } = Layout;

function ManagementPageFrame({ children }) {
  const dispatch = useDispatch();

  const username = useSelector(s => s.currentUser.username);

  return (
    <Layout>
      <Header style={{ padding: 0 }}>
        <Col lg={12} style={{ paddingLeft: 24 }}>
          <h1 style={{ fontSize: 24, color: "#ddd", marginRight: "auto" }}>
            IT Asset Management System
          </h1>
        </Col>
        <Col xs={0} lg={12} style={{ paddingRight: 24, textAlign: "right" }}>
          {username === "admin" ? (
            <Button ghost style={{ marginRight: 8 }} href="admin">
              <Icon type="eye" />
              Admin page
            </Button>
          ) : null}
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

const EXTERNAL_LINKS = {
  "/user": "admin/auth/user/",
  "/import": "/static/bulk_format_proposal.pdf"
};

function Sidebar() {
  const history = useHistory();

  const username = useSelector(s => s.currentUser.username);
  const isAdmin = username === "admin";

  function handleClick(e) {
    const key = e.key;
    const ext = EXTERNAL_LINKS[key];
    if (ext) {
      window.open(ext, "_blank");
    } else {
      history.push(e.key);
    }
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

      <Menu.Item key="/reports">
        <Icon type="tool" />
        <span>Reports</span>
      </Menu.Item>

      {isAdmin ? (
        <Menu.Item key="/user">
          <Icon type="user" />
          Users
        </Menu.Item>
      ) : null}

      {isAdmin ? (
        <Menu.Item key="/import">
          <Icon type="import" />
          Bulk format
        </Menu.Item>
      ) : null}
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
