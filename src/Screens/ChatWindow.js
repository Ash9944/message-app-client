import React, { useState, useEffect, useRef } from "react";
import socket from '../socketOperations.js';
import { fetchMessages, fetchSingleGroup, updateGroup, deleteGroup } from '../httpRequests';
import { Modal, Button, ListGroup, Form } from 'react-bootstrap';
import MultiSelectDropdown from '../Common/ui-select.js'
import moment from "moment";

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

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview("");
  };

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
    return

  }

  return (
    <div className="col-12 col-lg-7 col-xl-9 h-100">
      <div className="py-2 px-4 border-bottom d-none d-lg-block">
        <div className="d-flex align-items-center py-1">
          <div className="position-relative">
            <img src={activeChat.image} className="rounded-circle mr-1" alt={activeChat.userId} width="40" height="40" />
          </div>
          <div className="flex-grow-1 pl-3">
            <strong>{activeChat.userId}</strong>
            {/* <div className="text-muted small"><em>Typing...</em></div> */}
          </div>
          {activeChat.groupId && <div class="dropdown dropleft">
            <button className="btn btn-light border btn-lg px-3" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-more-horizontal feather-lg"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
            </button>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <a class="dropdown-item" onClick={openGroupModal}>Edit</a>
              {/* <a class="dropdown-item" href="#">Something else here</a> */}
            </div>
          </div>}
        </div>
      </div>

      <div className="position-relative">
        <div className="chat-messages p-4" style={{ height: "700px", overflowY: "auto" }}>
          {messages.map((item, ind) =>
          (

            <div key={ind} className={`chat-message-${item.from === userDetails.userId ? "right" : "left"} pb-4`}>
              <div>
                <img src="https://bootdey.com/img/Content/avatar/avatar1.png" className="rounded-circle mr-1" alt="Chris Wood" width="40" height="40" />
                <div className="text-muted small text-nowrap mt-2">{moment(item.on).format("hh:mm A")}</div>
              </div>
              {
                item.attachment ? (
                  <div className="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
                    <div className="font-weight-bold mb-1">{item.from === userDetails.userId ? "You" : item.from}</div>
                    <div className="mb-1">{(item.attachmentType && item.attachmentType.startsWith("image/")) && <img src={item.attachment} style={{ "maxHeight": "400px", "maxWidth": "400px" }} />}
                      {(item.attachmentType && item.attachmentType.startsWith("video/")) && <video controls className="chat-video" style={{ maxHeight: "400px", maxWidth: "400px" }} > <source src={item.attachment} type="video/mp4" /> </video>}</div>
                    {item.message}
                  </div>) :
                  (<div className="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
                    <div className="font-weight-bold mb-1">{item.from === userDetails.userId ? "You" : item.from}</div>
                    {item.message}
                  </div>)
              }

            </div>
          )
          )}

        </div>
      </div>

      <div className="p-3 bg-light border-top">
        <div className="input-group align-items-center">
          {/* File Attachment Icon */}
          <label htmlFor="file-input" className="btn btn-outline-secondary">
            📎
          </label>
          <input
            id="file-input"
            type="file"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {/* Image Preview Inside Input Box */}
          <div className="position-relative d-flex align-items-center">
            {filePreview && (
              <div className="preview-container d-flex align-items-center mx-2">
                {/* Image Preview */}
                {selectedFile.type.startsWith("image/") && (
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="img-thumbnail"
                    style={{ maxHeight: "400px", maxWidth: "400px" }} // Adjust size
                  />
                )}

                {/* Video Preview */}
                {selectedFile.type.startsWith("video/") && (
                  <video controls className="chat-video" style={{ maxHeight: "400px", maxWidth: "400px" }}>
                    <source src={filePreview} type={selectedFile.type} />
                    Your browser does not support the video tag.
                  </video>
                )}

                {/* Remove Button */}
                <button className="btn btn-danger btn-sm mx-1" onClick={removeFile}>
                  ✖
                </button>
              </div>
            )}
          </div>

          {/* Text Input */}
          <input
            type="text"
            className="form-control"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />

          {/* Send Button */}
          <button className="btn btn-primary" onClick={sendMessage}>
            Send
          </button>
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
                  selectedMembers.map((member, index) =>
                    <div class="row">
                      <li className="mt-1 col-6" key={index}>{member}</li>  {admin.includes(userDetails.userId) && member != userDetails.userId && <div className="mt-1 col-6"><button onClick={(e) => removeGroupMember(e, index)}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
                        <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                      </svg></button></div>}
                    </div>)
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
