import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Layout,
  Menu,
  Col,
  Button,
  Select,
  Row,
} from "antd";
import {
  EyeInvisibleOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  BuildOutlined,
  TableOutlined,
  BookOutlined,
  BarsOutlined,
  UserOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import {
  AuthContext,
  DCContext,
} from "../../contexts/Contexts";
import HGreed from "../utility/HGreed";
import { getDatacenters } from "../../api/datacenter";
import { logout } from "../../api/auth";

const { Header, Content, Sider } = Layout;

function ManagementPageFrame({ children }) {
  const { user } = useContext(AuthContext);
  const { datacenter, setDCByID } = useContext(DCContext);

  const [datacenters, setDatacenters] = useState([]);

  React.useEffect(() => {
    (async () => {
      const dcs = await getDatacenters();
      setDatacenters(dcs);
    })();
  }, []);

  const isAdmin = user.is_staff;
  const selectedDCID = datacenter?.id ?? -1;

  async function onLogout() {
    const { redirectTo } = await logout();
    window.location.href = redirectTo ?? "/";
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ padding: 0 }}>
        <Row>
          <Col style={{ paddingLeft: 24 }}>
            <h1
              style={{
                fontSize: 24,
                color: "#ddd",
                marginRight: "auto",
                marginBottom: 0,
              }}
            >
              IT Asset Management System
            </h1>
          </Col>
          <HGreed />
          <Col style={{ paddingRight: 24 }}>
            <Select
              value={selectedDCID}
              onChange={setDCByID}
              style={{ width: 250, marginRight: 8 }}
            >
              <Select.Option value={-1} title="Global">
                Global
              </Select.Option>
              {datacenters.map((ds, idx) => (
                <Select.Option
                  key={idx}
                  value={ds.id}
                >{`${ds.name} (${ds.abbr})`}</Select.Option>
              ))}
            </Select>
            {isAdmin ? (
              <Button
                ghost
                style={{ marginRight: 8 }}
                href="admin"
              >
                <EyeInvisibleOutlined />
                Admin page
              </Button>
            ) : null}
            <Button ghost onClick={onLogout}>
              <LogoutOutlined />
              Logout
            </Button>
          </Col>
        </Row>
      </Header>
      <Layout>
        <Sider width={160} theme="light" collapsible>
          <Sidebar />
        </Sider>
        <Layout style={{ padding: "0 16px 16px" }}>
          <Content style={{ backgroundColor: "white" }}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

const EXTERNAL_LINKS = {
  "/user": "admin/auth/user/",
  "/import": "/static/bulk_format_proposal.pdf",
};

function Sidebar() {
  const history = useHistory();

  const { user } = useContext(AuthContext);
  const isAdmin = user.is_staff;

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
    <Menu
      onClick={handleClick}
      selectedKeys={[]}
      mode="inline"
    >
      <Menu.Item key="/">
        <AppstoreOutlined />
        <span>Overview</span>
      </Menu.Item>

      <Menu.Item key="/models">
        <InboxOutlined />
        <span>Models</span>
      </Menu.Item>

      <Menu.Item key="/assets">
        <DatabaseOutlined />
        <span>Assets</span>
      </Menu.Item>

      <Menu.Item key="/datacenters">
        <BuildOutlined />
        <span>Datacenters</span>
      </Menu.Item>

      <Menu.Item key="/racks">
        <TableOutlined />
        <span>Racks</span>
      </Menu.Item>

      <Menu.Item key="/reports">
        <BookOutlined />
        <span>Reports</span>
      </Menu.Item>

      <Menu.Item key="/logs">
        <BarsOutlined />
        <span>Logs</span>
      </Menu.Item>

      {isAdmin ? (
        <Menu.Item key="/user">
          <UserOutlined />
          Users
        </Menu.Item>
      ) : null}
    </Menu>
  );
}

export default ManagementPageFrame;
