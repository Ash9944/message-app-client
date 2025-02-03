import React, { useState } from "react";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";


const Home = () => {
  const [activeChat, setActiveChat] = useState(null);

  return (
    <div className="container-fluid vh-100 d-flex flex-column">

      {/* Main Content */}
      <div className="row flex-grow-1 overflow-hidden">
        {/* Chat List (Left Sidebar) */}
        <div className="col-md-4 bg-light border-end overflow-auto" style={{padding: "0px"}}>
          <ChatList setActiveChat={setActiveChat} />
        </div>

        {/* Chat Window (Right Side) */}
        <div className="col-md-8 d-flex flex-column" style={{padding: "0px"}}>
          <ChatWindow activeChat={activeChat} />
        </div>
      </div>
    </div>
  );
};

export default Home;
