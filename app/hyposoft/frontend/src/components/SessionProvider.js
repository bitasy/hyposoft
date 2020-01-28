import React from 'react';
import Cookies from 'js-cookie';
import Session from '../contexts/Session';
import API from '../api/API';
import { SESSION_COOKIE_NAME } from '../api/API';

function isAuthCookieThere() {
  return Cookies.get(SESSION_COOKIE_NAME) != null;
}

const SessionProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(isAuthCookieThere());

  function login(username, password) {
    return API.login(username, password)
      .then(() => setIsLoggedIn(isAuthCookieThere()));
  }

  function logout() {
    return API.logout()
      .then(() => setIsLoggedIn(isAuthCookieThere()));
  }
  
  return (
    <Session.Provider value={{isLoggedIn, login, logout}}>
      {children}
    </Session.Provider>
  );
}

export default SessionProvider;