import React from 'react';

function ManagementPageFrame({children}) {
  return (
    <div>
      <Header/>
      <div>
        {children}
      </div>
      <Footer/>
    </div>
  )
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

export default ManagementPageFrame;