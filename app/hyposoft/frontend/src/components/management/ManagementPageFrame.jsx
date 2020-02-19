import React from "react";
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { Layout, Menu, Icon, Col, Button, Select } from "antd";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchDatacenters,
  switchDatacenter
} from "../../redux/datacenters/actions";
import { logout } from "../../redux/session/actions";
import { GLOBAL_ABBR } from "../../api/API";

const { Header, Content, Sider } = Layout;
const { Option } = Select;

function ManagementPageFrame({ children }) {
  const dispatch = useDispatch();
  const isAdmin = useSelector(s => s.currentUser.is_superuser);
  const datacenters = useSelector(s => Object.values(s.datacenters));
  const dcName = useSelector(s => s.appState.dcName);

  React.useEffect(() => {
    dispatch(fetchDatacenters());
  }, []);

  function onLogout() {
    dispatch(
      logout(res => {
        if (res.redirectTo) {
          window.location.href = res.redirectTo;
        } else {
          window.location.href = "/";
        }
      })
    );
  }

  function handleDCSelection(dcName) {
    dispatch(switchDatacenter(dcName));
  }

  return (
    <Layout>
      <Header style={{ padding: 0 }}>
        <Col lg={12} style={{ paddingLeft: 24 }}>
          <h1 style={{ fontSize: 24, color: "#ddd", marginRight: "auto" }}>
            IT Asset Management System
          </h1>
        </Col>
        <Col xs={0} lg={12} style={{ paddingRight: 24, textAlign: "right" }}>
          {dcName ? (
            <Select
              value={dcName}
              onChange={handleDCSelection}
              style={{ width: 150, marginRight: 8 }}
            >
              <Option key={GLOBAL_ABBR}>Global</Option>
              {datacenters.map(ds => (
                <Option key={ds.abbr} title={`${ds.name} (${ds.abbr})`}>
                  {`${ds.name} (${ds.abbr})`}
                </Option>
              ))}
            </Select>
          ) : null}
          {isAdmin ? (
            <Button ghost style={{ marginRight: 8 }} href="admin">
              <Icon type="eye" />
              Admin page
            </Button>
          ) : null}
          <Button ghost onClick={onLogout}>
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

  const isAdmin = useSelector(s => s.currentUser.is_superuser);

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

      <Menu.Item key="/assets">
        <Icon type="database" />
        <span>Assets</span>
      </Menu.Item>

      <Menu.Item key="/datacenters">
        <Icon type="build" />
        <span>Datacenters</span>
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
