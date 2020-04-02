import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import Cookies from "js-cookie";
import App, {
  CHANGE_PLAN_SESSION_KEY,
  DATACENTER_ABBR_SESSION_KEY,
} from "./components/App";
import "antd/dist/antd.css";
import { DATACENTER_HEADER_NAME, CHANGEPLAN_HEADER_NAME } from "./api/utils";

axios.interceptors.request.use(config => {
  if (!config) return config;
  if (Cookies.get("authtoken")) {
    config.headers["Authorization"] = "Token " + Cookies.get("authtoken");
  }
  if (Cookies.get("csrftoken")) {
    if (
      ![
        "get",
        "GET",
        "head",
        "HEAD",
        "options",
        "OPTIONS",
        "trace",
        "TRACE",
      ].includes(config.method)
    ) {
      config.headers["X-CSRFToken"] = Cookies.get("csrftoken");
    }
  }

  const dcHeader =
    config.headers[DATACENTER_HEADER_NAME] ??
    sessionStorage.getItem(DATACENTER_ABBR_SESSION_KEY);
  if (dcHeader) {
    config.headers[DATACENTER_HEADER_NAME] = dcHeader;
  }

  config.headers[CHANGEPLAN_HEADER_NAME] =
    config.headers[CHANGEPLAN_HEADER_NAME] ??
    sessionStorage.getItem(CHANGE_PLAN_SESSION_KEY) ??
    0;

  console.log(config);

  return config;
});

axios.defaults.validateStatus = statusCode => statusCode <= 500;

/* eslint-env browser */
ReactDOM.render(<App />, document.getElementById("app"));
