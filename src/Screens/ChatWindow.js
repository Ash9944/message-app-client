import React, { useState, useEffect } from "react";
import socket from '../socketOperations.js';
import { fetchMessages } from '../httpRequests';
; // Connect to backend

const ChatWindow = ({ activeChat }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const userDetails = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : null;

  useEffect(() => {
    if(activeChat){
      fetchChatMessages(activeChat.userId);
    }
    
    socket.on("oneToOneMessages", async (data) => {
      fetchChatMessages(data.from);
    });
  }, [activeChat]);

  async function fetchChatMessages(from) {
    const userDetails = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : null;
    let chats = await fetchMessages(from, userDetails.userId);
    setMessages(chats)
  }

  const sendMessage = () => {
    if(!input){
      return ;
    }

    socket.emit('oneToOneMessages', { to: activeChat.userId, input });
    setInput("");
  };

  if (!activeChat) {
    return <div className="d-flex align-items-center justify-content-center h-100">Select a chat to start messaging</div>;
  } 

  return (
    <div className="d-flex flex-column h-100">
      {/* Chat Header */}
      <div className="bg-success text-white p-3">
        <h5 className="m-0">{activeChat.userId}</h5>
      </div>

      {/* Chat Messages */}
      <div className="flex-grow-1 p-3 overflow-auto chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 text-${msg.from === userDetails.userId ? "end" : "start"}`}>
            <span className={`badge bg-${msg.from === userDetails.userId  ? "success" : "secondary"}`}>{msg.message}</span>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="p-3 bg-light border-top">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <button className="btn btn-primary" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
