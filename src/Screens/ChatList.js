import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { fetchUsers, fetchAllMessages, createGroup } from '../httpRequests';
import { Modal, Button, ListGroup, Form } from 'react-bootstrap';
import socket from '../socketOperations.js';
import MultiSelectDropdown from '../Common/ui-select.js'

const ChatList = ({ setActiveChat }) => {
  const [showModal, setShowModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [chats, setChats] = useState([]);
  const [friends, srtFriends] = useState([]);
  const [groupName, setGroupName] = useState([]);
  const [members, setGroupFriends] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const handleGroupCloseModal = () => {
    setGroupName([]);
    setGroupFriends([]);
    setSelectedMembers([]);
    setShowGroupModal(false);
  }
  const handleCloseModal = () => setShowModal(false);

  useEffect(() => {
    fetchUsersForChat();

    socket.on("groupChanges", () => {
      fetchUsersForChat();
    });

    socket.on("oneToOneMessages", async () => {
      fetchUsersForChat();
    });

  }, []);

  async function openModal() {
    const userDetails = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : null;
    let friends = await fetchUsers(userDetails.userId, false)
    srtFriends(friends);
    setShowModal(true);
  }

  async function openGroupModal() {
    const userDetails = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : null;
    let friends = await fetchUsers(userDetails.userId, false)
    setGroupFriends(friends);
    setShowGroupModal(true);
  }

  async function handleSelectPerson(person) {
    setShowModal(false);
    setActiveChat(person);
  }

  async function fetchUsersForChat() {
    const userDetails = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : null;
    let response = await fetchAllMessages(userDetails.userId, true);
    setChats(response);
  }

  async function handleCreateGroup(e) {
    try {
      e.preventDefault();
      const userDetails = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : null;
      var response = await createGroup({
        "groupName": groupName,
        "members": selectedMembers.map(item => item.label),
        "createdBy": userDetails.userId
      })

      setShowGroupModal(false);
      setActiveChat({
        "userId": response.name,
        "groupId": response.groupId
      });

      fetchUsersForChat();
      socket.emit("groupChanges", { groupId: response.groupId });
      
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div class="col-12 col-lg-5 col-xl-3 border-right">

					<div class="px-4 d-none d-md-block">
						<div class="d-flex align-items-center">
							<div class="flex-grow-1">
								<input type="text" class="form-control my-3" placeholder="Search..." />
							</div>
						</div>
					</div>

					<a href="#" class="list-group-item list-group-item-action border-0">
						<div class="badge bg-success float-right">5</div>
						<div class="d-flex align-items-start">
							<img src="https://bootdey.com/img/Content/avatar/avatar5.png" class="rounded-circle mr-1" alt="Vanessa Tucker" width="40" height="40" />
							<div class="flex-grow-1 ml-3">
								Vanessa Tucker
								<div class="small"><span class="fas fa-circle chat-online"></span> Online</div>
							</div>
						</div>
					</a>
					
					<hr class="d-block d-lg-none mt-1 mb-0" />
		</div>
  );
};
export default ChatList;
