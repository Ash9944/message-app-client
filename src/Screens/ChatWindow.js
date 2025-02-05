import React, { useState, useEffect, useRef } from "react";
import socket from '../socketOperations.js';
import { fetchMessages, fetchSingleGroup, updateGroup, deleteGroup } from '../httpRequests';
import { Modal, Button, ListGroup, Form } from 'react-bootstrap';
import MultiSelectDropdown from '../Common/ui-select.js'

const ChatWindow = ({ activeChat }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const userDetails = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : null;
  const chatRef = useRef(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupName, setGroupName] = useState([]);
  const [admin, setGroupAdmin] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [attachment, setAttachment] = useState(null);
  useEffect(() => {
    if (activeChat) {
      fetchChatMessages(activeChat.userId, activeChat.groupId);
    }

    socket.on("oneToOneMessages", async (data) => {
      fetchChatMessages(data.from, data.groupId);
    });
  }, [activeChat]);

  const handleGroupCloseModal = () => setShowGroupModal(false);
  async function openGroupModal() {
    let group = await fetchSingleGroup(activeChat.groupId);

    setGroupName(group.name);
    setSelectedMembers(group.members);
    setGroupAdmin(group.admin);

    setShowGroupModal(true);
  }

  async function fetchChatMessages(from, groupId) {
    const userDetails = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : null;
    let chats = await fetchMessages(from, userDetails.userId, groupId);

    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }

    setMessages(chats);
  }

  function removeGroupMember(e, index) {
    e.preventDefault();
    const updatedMembers = selectedMembers.filter((_, i) => i !== index);
    setSelectedMembers(updatedMembers);
  }

  async function editGroup(e, groupId) {
    try {
      e.preventDefault();
      var data = {
        "name": groupName,
        "members": selectedMembers,
      }
      await updateGroup(groupId, data);
      handleGroupCloseModal();
      socket.emit("groupChanges", { groupId: groupId });
    } catch (error) {

    }

  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file)); // Create preview URL

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setAttachment({
          from: userDetails.userId,
          message: file.name,
          file: reader.result, // Convert file to Base64
          fileType: file.type,
          on: new Date(),
        });
      };
    }
  };

  async function deleteGroupPermanent(e, groupId) {
    try {
      e.preventDefault();
      await deleteGroup(groupId);
      handleGroupCloseModal();
      socket.emit("groupChanges", { groupId: groupId });
    } catch (error) {

    }
  }

  const sendMessage = () => {
    if (!input) {
      return;
    }

    socket.emit('oneToOneMessages', { to: activeChat.userId, input, groupId: activeChat.groupId, attachment: attachment });
    setInput("");
    setSelectedFile(null);
    setFilePreview(null);
    setAttachment(null);
  };

  if (!activeChat) {
    return <div className="d-flex align-items-center justify-content-center h-100">Select a chat to start messaging</div>;
  }

  return (
    <div className="d-flex flex-column h-100">
      {/* Chat Header */}
      <div className="row bg-success text-white p-3">
        <h5 className="col mt-2">{activeChat.userId}</h5>
        {activeChat.groupId && <button className="col-4 btn btn-success" onClick={openGroupModal}>Edit Group</button>}
      </div>

      {/* Chat Messages */}
      <div className="flex-grow-1 p-3 overflow-auto chat-window" ref={chatRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 text-${msg.from === userDetails.userId ? "end" : "start"}`}>
            <div className="d-inline-block">
              <small className="d-block text-muted">
                {msg.groupId && msg.from}
              </small>
              {msg.attachment ? 
              <div className={`badge bg-${msg.from === userDetails.userId ? "success" : "secondary"}`}>
              {(msg.attachmentType && msg.attachmentType.startsWith("image/")) && <img src={msg.attachment} style={{ "maxHeight": "400px", "maxWidth": "400px" }}  /> }
              { (msg.attachmentType && msg.attachmentType.startsWith("video/")) && <video controls className="chat-video" style={{ maxHeight: "400px", maxWidth: "400px" }} > <source src={msg.attachment} type="video/mp4" /> </video>}

              <div class='mt-3'>{msg.message}</div>
              </div> :
                <span className={`badge bg-${msg.from === userDetails.userId ? "success" : "secondary"}`}>
                  {msg.message}
                </span>}
              <small className="d-block text-muted">
                {new Date(msg.on).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </small>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="p-3 bg-light border-top">
        <div className="input-group">
          <label htmlFor="file-input" className="btn btn-outline-secondary">
            📎
          </label>
          <input
            id="file-input"
            type="file"
            style={{ display: "none" }}
            onChange={(e) => handleFileChange(e)}
          />
          {(filePreview && selectedFile.type.startsWith("image/")) && (<img src={filePreview} alt="Preview" className="img-thumbnail mx-2" style={{ maxHeight: "400px", maxWidth: "400px" }} />) }
          { (filePreview && selectedFile.type.startsWith("video/")) &&  (<video controls className="chat-video" style={{ maxHeight: "400px", maxWidth: "400px" }} > <source src={filePreview} type="video/mp4" /> </video>)
          }
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

      <Modal show={showGroupModal} onHide={handleGroupCloseModal} backdrop="static" keyboard={false} >
        <Form>
          <Modal.Header closeButton>
            <Modal.Title>Edit Group</Modal.Title>
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
            <div class="mt-3">
              <Form.Label>Group Members</Form.Label>
              <ul>
                {selectedMembers && selectedMembers.length ? (
                  selectedMembers.map((member, index) => <div class="row"> <li className="mt-1 col" key={index}>{member}</li>  {admin.includes(userDetails.userId) && member != userDetails.userId && <button onClick={(e) => removeGroupMember(e, index)} className="col me-4 mt-2 btn btn-danger">Remove</button>}</div>)
                ) : (
                  <p>No members selected</p>
                )}
              </ul>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleGroupCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" onClick={async (e) => await editGroup(e, activeChat.groupId)}>
              Edit Group
            </Button>

            {admin && admin.includes(userDetails.userId) && <Button type="submit" variant="danger" onClick={async (e) => await deleteGroupPermanent(e, activeChat.groupId)}>
              Delete Group
            </Button>}
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ChatWindow;
