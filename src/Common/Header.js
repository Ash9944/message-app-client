import React from "react";
import socket from '../socketOperations.js';

const Header = () => {
  const userDetails = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : null;
  const onLogout = () => {
    localStorage.removeItem("userDetails");
    socket.disconnect();
    window.location.reload()
  }

  return (
    <nav className="navbar navbar-light bg-dark px-3" id="header">
      {/* Logo on the Left */}
      <a className="navbar-brand" href="/">
        <span className="ms-2 fw-bold">Messaging App</span>
      </a>

      {/* Logout on the Right */} 
      { userDetails && <button className="btn btn-danger" onClick={onLogout}>
        Logout
      </button> }
    </nav>
  );
};

export default Header;
