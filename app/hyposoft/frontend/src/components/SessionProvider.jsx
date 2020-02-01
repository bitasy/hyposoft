import React from "react";
import PropTypes from "prop-types";
import Session from "../contexts/Session";
import API, { TOKEN_KEY } from "../api/API";

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

function storeToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

function removeToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

const SessionProvider = ({ children }) => {
  const [token, setToken] = React.useState(getToken());

  function login(username, password) {
    return API.login(username, password).then(token => {
      if (token) {
        storeToken(token);
        setToken(token);
      }
    });
  }

  function logout() {
    return API.logout().then(() => {
      removeToken();
      setToken(null);
    });
  }

  return (
    <Session.Provider value={{ login, logout, token }}>
      {children}
    </Session.Provider>
  );
};

SessionProvider.propTypes = {
  children: PropTypes.node
};

SessionProvider.defaultProps = {
  children: null
};

export default SessionProvider;
