import React from "react";
import PropTypes from "prop-types";

function ManagementPageFrame({ children }) {
  return (
    <div>
      <Header />
      <div>{children}</div>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <div>
      <h1>Header</h1>
    </div>
  );
}

function Footer() {
  return (
    <div>
      <h1>Footer</h1>
    </div>
  );
}

ManagementPageFrame.propTypes = {
  children: PropTypes.elementType
};

ManagementPageFrame.defaultProps = {
  children: null
};

export default ManagementPageFrame;
