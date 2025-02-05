import socket from '../socketOperations.js';
import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "./AppContext";

const Header = () => {
  const [state, setState] = useState(null);
  const { user ,setUser } = useContext(AppContext);

  useEffect(() => {

    socket.on("error", async (data) => {
      onLogout();
    });


  }, [user]);

  const onLogout = () => {
    localStorage.removeItem("userDetails");
    setUser(null);
    setState(null);
    socket.disconnect();
    window.location.reload()
  }

  return (
    <nav className="navbar navbar-light bg-dark px-3" id="header">
      {/* Logo on the Left */}
      <a className="navbar-brand" href="/">
        <span className="ms-2 text-white fw-bold">Messaging App</span>
      </a>

      {/* Logout on the Right */}
      {user && <button className="btn btn-danger" onClick={onLogout}>
        Logout
      </button>}
    </nav>
  );
};

export default Header;
