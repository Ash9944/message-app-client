import { io } from "socket.io-client";
import React, { useState, useEffect } from "react";

const socket = io("http://localhost:5000", {
    "autoConnect": false,
    "pingTimeout": 60000, // Wait 60 seconds before timing out
    "pingInterval": 25000, // Send a ping every 25 seconds
    "cors": {
        origin: "http://localhost:5000",
        methods: ["GET", "POST"]
    }
});

// Attempt to restore connection on page load
window.addEventListener('load', () => {
    const userDetails = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : null;
    if (userDetails && userDetails.userId && userDetails.token) {
        socket.auth = {
            token: userDetails.token,
            userId: userDetails.userId
        };

        socket.connect();
        socket.emit('joinGroup', { userId: userDetails.userId });
    }
});


export default socket;