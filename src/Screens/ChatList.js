import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { fetchUsers , fetchAllMessages } from '../httpRequests';
import { Modal, Button, ListGroup } from 'react-bootstrap';

const ChatList = ({ setActiveChat }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const [chats, setChats] = useState([]);
  const [friends, srtFriends] = useState([]);

  useEffect(() => {
    fetchUsersForChat()
  }, []);

  async function openModal() {
    const userDetails = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : null;
    let friends = await fetchUsers(userDetails.userId, false)
    srtFriends(friends);
    setShowModal(true);
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

  return (
    <div className="list-group chat-list">
      <button className="list-group-item list-group-item-action" onClick={async () => await openModal()}>
        <strong>Add Member to Chat</strong>
      </button>

      <button className="list-group-item list-group-item-action" onClick={async () => await openModal()}>
        <strong>Add Group</strong>
      </button>

      {chats.map((chat) => (
        <button
          key={chat.id}
          className="list-group-item list-group-item-action"
          onClick={() => setActiveChat(chat)}
        >
          <strong>{chat.name}</strong>
          <p className="small text-muted">{chat.lastMessage}</p>
        </button>
      ))}

      <Modal show={showModal} onHide={handleCloseModal} backdrop="static"  // Prevents closing when clicking outside
        keyboard={false} >
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
    </div>
  );
};

export default ChatList;
