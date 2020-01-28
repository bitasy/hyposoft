import React from 'react';

const Session = React.createContext({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

export default Session;