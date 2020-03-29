import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import Cookies from "js-cookie";
import App from "./components/App";
import "antd/dist/antd.css";

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

  return config;
});

axios.defaults.validateStatus = statusCode => statusCode <= 500;

/* eslint-env browser */
ReactDOM.render(<App />, document.getElementById("app"));
