import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import Cookies from "js-cookie";
import App from "./components/App";
import store from "./redux/store";
import { Provider } from "react-redux";
import "./index.css";

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
        "TRACE"
      ].includes(config.method)
    ) {
      config.headers["X-CSRFToken"] = Cookies.get("csrftoken");
    }
  }

  return config;
});

axios.defaults.validateStatus = statusCode => statusCode < 300;

axios.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
);

/* eslint-env browser */
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("app")
);
