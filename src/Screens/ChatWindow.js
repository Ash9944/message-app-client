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

  // if (!activeChat) {
  //   return <div className="col-12 col-lg-7 col-xl-9 h-100">Select a chat to start messaging</div>;
  // }

  return (
    <div className="col-12 col-lg-7 col-xl-9 h-100">
      <div className="py-2 px-4 border-bottom d-none d-lg-block">
        <div className="d-flex align-items-center py-1">
          <div className="position-relative">
            <img src="https://bootdey.com/img/Content/avatar/avatar3.png" className="rounded-circle mr-1" alt="Sharon Lessman" width="40" height="40" />
          </div>
          <div className="flex-grow-1 pl-3">
            <strong>Sharon Lessman</strong>
            <div className="text-muted small"><em>Typing...</em></div>
          </div>
          <div>
            {/* <button className="btn btn-light border btn-lg px-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-more-horizontal feather-lg"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg></button> */}
            <div class="dropdown dropleft">
              <button className="btn btn-light border btn-lg px-3" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-more-horizontal feather-lg"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
              </button>
              <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <a class="dropdown-item" href="#">Action</a>
                <a class="dropdown-item" href="#">Another action</a>
                <a class="dropdown-item" href="#">Something else here</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="position-relative">
        <div className="chat-messages p-4">

          <div className="chat-message-right pb-4">
            <div>
              <img src="https://bootdey.com/img/Content/avatar/avatar1.png" className="rounded-circle mr-1" alt="Chris Wood" width="40" height="40" />
              <div className="text-muted small text-nowrap mt-2">2:33 am</div>
            </div>
            <div className="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
              <div className="font-weight-bold mb-1">You</div>
              Lorem ipsum dolor sit amet, vis erat denique in, dicunt prodesset te vix.
            </div>
          </div>

          <div className="chat-message-left pb-4">
            <div>
              <img src="https://bootdey.com/img/Content/avatar/avatar3.png" className="rounded-circle mr-1" alt="Sharon Lessman" width="40" height="40" />
              <div className="text-muted small text-nowrap mt-2">2:34 am</div>
            </div>
            <div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
              <div className="font-weight-bold mb-1">Sharon Lessman</div>
              Sit meis deleniti eu, pri vidit meliore docendi ut, an eum erat animal commodo.
            </div>
          </div>

          <div className="chat-message-right mb-4">
            <div>
              <img src="https://bootdey.com/img/Content/avatar/avatar1.png" className="rounded-circle mr-1" alt="Chris Wood" width="40" height="40" />
              <div className="text-muted small text-nowrap mt-2">2:35 am</div>
            </div>
            <div className="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
              <div className="font-weight-bold mb-1">You</div>
              Cum ea graeci tractatos.
            </div>
          </div>

          <div className="chat-message-left pb-4">
            <div>
              <img src="https://bootdey.com/img/Content/avatar/avatar3.png" className="rounded-circle mr-1" alt="Sharon Lessman" width="40" height="40" />
              <div className="text-muted small text-nowrap mt-2">2:36 am</div>
            </div>
            <div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
              <div className="font-weight-bold mb-1">Sharon Lessman</div>
              Sed pulvinar, massa vitae interdum pulvinar, risus lectus porttitor magna, vitae commodo lectus mauris et velit.
              Proin ultricies placerat imperdiet. Morbi varius quam ac venenatis tempus.
            </div>
          </div>

          <div className="chat-message-left pb-4">
            <div>
              <img src="https://bootdey.com/img/Content/avatar/avatar3.png" className="rounded-circle mr-1" alt="Sharon Lessman" width="40" height="40" />
              <div className="text-muted small text-nowrap mt-2">2:37 am</div>
            </div>
            <div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
              <div className="font-weight-bold mb-1">Sharon Lessman</div>
              Cras pulvinar, sapien id vehicula aliquet, diam velit elementum orci.
            </div>
          </div>

          <div className="chat-message-right mb-4">
            <div>
              <img src="https://bootdey.com/img/Content/avatar/avatar1.png" className="rounded-circle mr-1" alt="Chris Wood" width="40" height="40" />
              <div className="text-muted small text-nowrap mt-2">2:38 am</div>
            </div>
            <div className="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
              <div className="font-weight-bold mb-1">You</div>
              Lorem ipsum dolor sit amet, vis erat denique in, dicunt prodesset te vix.
            </div>
          </div>

          <div className="chat-message-left pb-4">
            <div>
              <img src="https://bootdey.com/img/Content/avatar/avatar3.png" className="rounded-circle mr-1" alt="Sharon Lessman" width="40" height="40" />
              <div className="text-muted small text-nowrap mt-2">2:39 am</div>
            </div>
            <div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
              <div className="font-weight-bold mb-1">Sharon Lessman</div>
              Sit meis deleniti eu, pri vidit meliore docendi ut, an eum erat animal commodo.
            </div>
          </div>

          <div className="chat-message-right mb-4">
            <div>
              <img src="https://bootdey.com/img/Content/avatar/avatar1.png" className="rounded-circle mr-1" alt="Chris Wood" width="40" height="40" />
              <div className="text-muted small text-nowrap mt-2">2:40 am</div>
            </div>
            <div className="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
              <div className="font-weight-bold mb-1">You</div>
              Cum ea graeci tractatos.
            </div>
          </div>

          <div className="chat-message-right mb-4">
            <div>
              <img src="https://bootdey.com/img/Content/avatar/avatar1.png" className="rounded-circle mr-1" alt="Chris Wood" width="40" height="40" />
              <div className="text-muted small text-nowrap mt-2">2:41 am</div>
            </div>
            <div className="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
              <div className="font-weight-bold mb-1">You</div>
              Morbi finibus, lorem id placerat ullamcorper, nunc enim ultrices massa, id dignissim metus urna eget purus.
            </div>
          </div>

          <div className="chat-message-left pb-4">
            <div>
              <img src="https://bootdey.com/img/Content/avatar/avatar3.png" className="rounded-circle mr-1" alt="Sharon Lessman" width="40" height="40" />
              <div className="text-muted small text-nowrap mt-2">2:42 am</div>
            </div>
            <div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
              <div className="font-weight-bold mb-1">Sharon Lessman</div>
              Sed pulvinar, massa vitae interdum pulvinar, risus lectus porttitor magna, vitae commodo lectus mauris et velit.
              Proin ultricies placerat imperdiet. Morbi varius quam ac venenatis tempus.
            </div>
          </div>

          <div className="chat-message-right mb-4">
            <div>
              <img src="https://bootdey.com/img/Content/avatar/avatar1.png" className="rounded-circle mr-1" alt="Chris Wood" width="40" height="40" />
              <div className="text-muted small text-nowrap mt-2">2:43 am</div>
            </div>
            <div className="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
              <div className="font-weight-bold mb-1">You</div>
              Lorem ipsum dolor sit amet, vis erat denique in, dicunt prodesset te vix.
            </div>
          </div>

          <div className="chat-message-left pb-4">
            <div>
              <img src="https://bootdey.com/img/Content/avatar/avatar3.png" className="rounded-circle mr-1" alt="Sharon Lessman" width="40" height="40" />
              <div className="text-muted small text-nowrap mt-2">2:44 am</div>
            </div>
            <div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
              <div className="font-weight-bold mb-1">Sharon Lessman</div>
              Sit meis deleniti eu, pri vidit meliore docendi ut, an eum erat animal commodo.
            </div>
          </div>

        </div>
      </div>

      <div className="flex-grow-0 py-3 px-4 border-top">
        <div className="input-group">
          <input type="text" className="form-control" placeholder="Type your message" />
          <button className="btn btn-primary">Send</button>
        </div>
      </div>

    </div>
  );
};

export default ChatWindow;
