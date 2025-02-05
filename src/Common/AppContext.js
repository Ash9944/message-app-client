import React, { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [group, setGroup] = useState("light");

  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : null
    if (!userDetails ||  !userDetails.userId || !userDetails.token) {
      setUser(null);
    }

    setUser(userDetails);
  }, []);

  return (
    <AppContext.Provider value={{ user, setUser, group, setGroup }}>
      {children}
    </AppContext.Provider>
  );
};
