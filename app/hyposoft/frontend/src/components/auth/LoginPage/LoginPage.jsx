import React from "react";
import { Form, Icon, Input, Button, Row, Col, Typography } from "antd";
import { useDispatch } from "react-redux";
import { login } from "../../../redux/actions";

const { Title, Paragraph } = Typography;

function LoginPage() {
  return (
    <Row type="flex" align="middle" justify="center" className="h100">
      <Col xs={22} lg={10} xl={6}>
        <Title className="center-text" level={2}>
          Hyposoft
        </Title>
        <Paragraph className="center-text">
          IT Asset Management System
        </Paragraph>
        <div className="mt-3">
          <WrappedLoginForm />
        </div>
      </Col>
    </Row>
  );
}

function LoginForm({ form }) {
  const dispatch = useDispatch();

  function handleSubmit(e) {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        const { username, password } = values;
        dispatch(login(username, password));
      }
    });
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Item>
        {form.getFieldDecorator("username", {
          rules: [{ required: true, message: "Please input your username!" }]
        })(
          <Input
            prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
            placeholder="Username"
          />
        )}
      </Form.Item>
      <Form.Item>
        {form.getFieldDecorator("password", {
          rules: [{ required: true, message: "Please input your Password!" }]
        })(
          <Input
            prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
            type="password"
            placeholder="Password"
          />
        )}
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" className="w100">
          Log in
        </Button>
      </Form.Item>
    </Form>
  );
}

const WrappedLoginForm = Form.create({ name: "login_form" })(LoginForm);

export default LoginPage;
