import React from "react";
import { string } from "prop-types";

const Session = React.createContext({
  token: string,
  login: () => {},
  logout: () => {}
});

export default Session;
