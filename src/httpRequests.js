import axios from "axios";
var backEndUrl = "http://localhost:5000"

async function loginUser(userDetails) {
    const userToken = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : {}
    let response = await axios.post(
        `${backEndUrl}/user/login`,
        userDetails,
        setHeaders(userToken)
    )

    if (!response.data) {
        throw new Error("Failed to Login");
    }

    return response.data;
}

async function registerUser(userDetails) {
    const userToken = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : {}
    let response = await axios.post(
        `${backEndUrl}/user/register`,
        userDetails,
        setHeaders(userToken)
    )

    if (!response.data) {
        throw new Error("Failed to register");
    }
    return response.data;
}

async function fetchUsers(userId, isFriends) {
    const userDetails = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : {}
    let response = await axios.get(`${backEndUrl}/user/${userId}/${isFriends}`, setHeaders(userDetails))

    if (!response.data) {
        throw new Error("Failed to register");
    }
    return response.data;
}

async function fetchMessages(fromId, toId, groupId) {
    const userDetails = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : {}
    let response = await axios.get(`${backEndUrl}/messages/fetch/${fromId}/${toId}/${groupId}`, setHeaders(userDetails))

    if (!response.data) {
        throw new Error("Failed to register");
    }
    return response.data;
}

async function fetchAllMessages(fromId, toId) {
    const userDetails = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : {}
    let response = await axios.get(`${backEndUrl}/messages/${fromId}`, setHeaders(userDetails))

    if (!response.data) {
        throw new Error("Failed to register");
    }
    return response.data;
}

async function createGroup(groupData) {
    const userDetails = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : {}
    let response = await axios.post(`${backEndUrl}/group`, groupData, setHeaders(userDetails));

    if (!response.data) {
        throw new Error("Failed to register");
    }
    return response.data;
}

async function fetchSingleGroup(groupId) {
    const userDetails = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : {}
    let response = await axios.get(`${backEndUrl}/group/${groupId}`, setHeaders(userDetails));

    if (!response.data) {
        throw new Error("Failed to register");
    }
    return response.data;
}

async function deleteGroup(groupId) {
    const userDetails = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : {}
    let response = await axios.delete(`${backEndUrl}/group/${groupId}`, setHeaders(userDetails));

    if (!response.data) {
        throw new Error("Failed to register");
    }
    return response.data;
}

async function updateGroup(groupId, groupData) {
    const userDetails = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : {}
    let response = await axios.put(`${backEndUrl}/group/${groupId}`, groupData, setHeaders(userDetails));

    if (!response.data) {
        throw new Error("Failed to register");
    }
    return response.data;
}

async function refreshToken() {
    const userDetails = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : {}
    let response = await axios.put(`${backEndUrl}/user/refresh/token/${userDetails.userId}`, setHeaders(userDetails));

    if (!response.data) {
        throw new Error("Failed to register");
    }
    return response.data;
}

function setHeaders(userDetails) {
    const options = {
        headers: {
            'Content-Type': 'application/json',
            'token': userDetails.token,
            'userId': userDetails.userId,
        }
    };

    return options;
}

export {
    loginUser,
    registerUser,
    fetchUsers,
    fetchMessages,
    fetchAllMessages,
    createGroup,
    fetchSingleGroup,
    deleteGroup,
    updateGroup,
    refreshToken
}