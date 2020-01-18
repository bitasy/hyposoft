import React from "react";
import Cookies from "js-cookie";
import PropTypes from "prop-types";
import Session from "../contexts/Session";
import API, { SESSION_COOKIE_NAME } from "../api/API";

function isAuthCookieThere() {
  return Cookies.get(SESSION_COOKIE_NAME) != null;
}

const SessionProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(isAuthCookieThere());

  function login(username, password) {
    return API.login(username, password).then(() =>
      setIsLoggedIn(isAuthCookieThere())
    );
  }

  function logout() {
    return API.logout().then(() => setIsLoggedIn(isAuthCookieThere()));
  }

  return (
    <Session.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </Session.Provider>
  );
};

SessionProvider.propTypes = {
  children: PropTypes.elementType
};

SessionProvider.defaultProps = {
  children: null
};

export default SessionProvider;
