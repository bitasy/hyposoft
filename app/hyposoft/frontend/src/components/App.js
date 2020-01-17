import React from "react";
import ReactDOM from "react-dom";

import SessionResolver from './SessionProvider';
import Session from "../contexts/Session";

const App = () => {
  return (
    <SessionResolver>
      <h1>Yo</h1>
    </SessionResolver>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));