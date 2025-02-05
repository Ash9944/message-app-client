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
    <div className="list-group chat-list">
      <button className="list-group-item list-group-item-action p-4" onClick={async () => await openModal()}>
        <strong>Add Member to Chat</strong>
      </button>

      <button className="list-group-item list-group-item-action p-4" onClick={async () => await openGroupModal()}>
        <strong>Add Group</strong>
      </button>

      {chats.map((chat) => (
        <button
          key={chat.id}
          className="list-group-item list-group-item-action"
          onClick={() => setActiveChat(chat)}
        >
          <strong>{chat.userId}</strong>
          <p className="small text-muted">{chat.lastMessage}</p>
        </button>
      ))}

      <Modal show={showModal} onHide={handleCloseModal} backdrop="static" keyboard={false} >
        <Modal.Header closeButton>
          <Modal.Title>Members to chat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {friends.map((person) => (
              <ListGroup.Item key={person.id} className="d-flex justify-content-between align-items-center">
                <span>{person.userId}</span>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSelectPerson(person)}
                >
                  Chat
                </Button>

              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showGroupModal} onHide={handleGroupCloseModal} backdrop="static" keyboard={false} >
        <Form>
          <Modal.Header closeButton>
            <Modal.Title>Create Group</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Group Name Input */}
            <Form.Group controlId="groupName">
              <Form.Label>Group Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />
            </Form.Group>
            <MultiSelectDropdown options={members} value={"_id"} label={"userId"} selectedMembers={setSelectedMembers} optionValue={selectedMembers} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleGroupCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" onClick={(e) => handleCreateGroup(e)}>
              Create Group
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ChatList;
