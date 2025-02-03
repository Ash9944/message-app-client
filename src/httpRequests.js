import axios from "axios";
var backEndUrl = "http://localhost:5000"

async function loginUser(userDetails) {
    let response = await axios.post(
        `${backEndUrl}/user/login`,
        userDetails,
    )

    if (!response.data) {
        throw new Error("Failed to Login");
    }

    return response.data;
}

async function registerUser(userDetails) {
    let response = await axios.post(
        `${backEndUrl}/user/register`,
        userDetails
    )

    if (!response.data) {
        throw new Error("Failed to register");
    }
    return response.data;
}

async function fetchUsers(userId, isFriends) {
    let response = await axios.get(`${backEndUrl}/user/${userId}/${isFriends}`)

    if (!response.data) {
        throw new Error("Failed to register");
    }
    return response.data;
}

async function fetchMessages(fromId, toId) {
    let response = await axios.get(`${backEndUrl}/messages/one/to/one/${fromId}/${toId}`)

    if (!response.data) {
        throw new Error("Failed to register");
    }
    return response.data;
}

async function fetchAllMessages(fromId, toId) {
    let response = await axios.get(`${backEndUrl}/messages/${fromId}`)

    if (!response.data) {
        throw new Error("Failed to register");
    }
    return response.data;
}

export {
    loginUser,
    registerUser,
    fetchUsers,
    fetchMessages,
    fetchAllMessages
}