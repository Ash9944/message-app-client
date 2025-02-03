import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
    "autoConnect": false,
    "reconnection": true,
    "reconnectionAttempts": 10,
    "reconnectionDelay": 1000,
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

    }

});


export default socket;