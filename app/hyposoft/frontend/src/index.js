import "./index.css";

import axios from "axios";
import Cookies from "js-cookie";

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

// down here since this component might fire off axios requests before the above configuration

import "./components/App";
