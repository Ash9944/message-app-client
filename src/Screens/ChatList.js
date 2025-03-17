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
    const userDetails = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : null;

    socket.on("groupChanges", (data) => {
      fetchUsersForChat();
      socket.emit("joinGroup", { userId: userDetails.userId });
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
      socket.emit("joinGroup", { groupId: response.groupId });

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
          <div>
            <div class="dropdown dropright">
              <button className="btn btn-light border btn-lg px-3" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-more-horizontal feather-lg"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
              </button>
              <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <a class="dropdown-item" onClick={async () => await openModal()}>Add Friend to chat</a>
                <a class="dropdown-item" onClick={async () => await openGroupModal()}>Create Group</a>
                {/* <a class="dropdown-item" href="#">Something else here</a> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {chats.map((item, index) => (
        <a key={index} className="list-group-item list-group-item-action border-0" onClick={(e) => { handleSelectPerson(item) }}>
          {/* <div className="badge bg-success float-right">5</div> */}
          <div className="d-flex align-items-start">
            <img
              src="https://bootdey.com/img/Content/avatar/avatar5.png"
              className="rounded-circle mr-1"
              alt={item.userId}
              width="40"
              height="40"
            />
            <div className="flex-grow-1 ml-3">
              {item.userId}
              <div className="small">
                <span className="fas fa-circle chat-online"></span> {item.lastMessage}
              </div>
              {/* <div className="small">
                <span className="fas fa-circle chat-online"></span> Online
              </div> */}
            </div>
          </div>
        </a>
      ))}
      {/* <a href="#" class="list-group-item list-group-item-action border-0">
						<div class="badge bg-success float-right">5</div>
						<div class="d-flex align-items-start">
							<img src="https://bootdey.com/img/Content/avatar/avatar5.png" class="rounded-circle mr-1" alt="Vanessa Tucker" width="40" height="40" />
							<div class="flex-grow-1 ml-3">
								Vanessa Tucker
								<div class="small"><span class="fas fa-circle chat-online"></span> Online</div>
							</div>
						</div>
					</a> */}

      <hr class="d-block d-lg-none mt-1 mb-0" />

      <Modal show={showModal} onHide={handleCloseModal} backdrop="static" keyboard={false} >
        <Modal.Header closeButton>
          <Modal.Title>Members to chat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <div class="flex-grow-1">
            <input type="text" class="form-control my-3" placeholder="Search..." />
          </div>
          <ListGroup>
            {friends.map((item, index) => (
              <a key={index} className="list-group-item list-group-item-action border-0" onClick={(e) => { handleSelectPerson(item) }}>
                {/* <div className="badge bg-success float-right">5</div> */}
                <div className="d-flex align-items-start">
                  <img
                    src="https://bootdey.com/img/Content/avatar/avatar5.png"
                    className="rounded-circle mr-1"
                    alt={item.userId}
                    width="40"
                    height="40"
                  />
                  <div className="flex-grow-1 ml-3">
                    {item.userId}
                    <div className="small">
                      <span className="fas fa-circle chat-online"></span> {item.lastMessage}
                    </div>
                    {/* <div className="small">
                <span className="fas fa-circle chat-online"></span> Online
              </div> */}
                  </div>
                </div>
              </a>
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
