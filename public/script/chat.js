document.addEventListener("DOMContentLoaded", function () {
  var socket = io();
  let username = localStorage.getItem("name");
  let userId = localStorage.getItem("id");
  let recipientUserId;
  let roomName;
  var typing = false;
  let isActive = [];
  var online = true;
  var timeout = undefined;
  let count = 0;
  let senderUser

  socket.emit("users", { userId: userId, popUp: false });
  socket.on("user list", function (userList) {
    displayUserList(userList);
  });

  function displayUserList(userList) {
    socket.on("sortUserList", function (data) {
      senderUser = userList.userList.find((user) => user.id == data.senderId);
      if(senderUser){
        displayUserList(userList);
      }
    })
    const userListContainer = document.getElementById("userList");
    userListContainer.innerHTML = "";

    userList.userList.forEach((user) => {
      let isSender
      if(senderUser){
        isSender = senderUser && user.id === senderUser.id
      }
      const userItem = document.createElement("div");
      userItem.className = "user-item";
      userItem.dataset.userId = user.id;
      userItem.dataset.toUserEmail = user.email;
      
      userItem.style.marginBlock = "5px";

      const userInfo = document.createElement("div");
      userInfo.className = "user-info";
      const userName = document.createElement("span");
      userName.textContent = user.firstName + " " + user.lastName;

      const onlineStatus = document.createElement("span");
      onlineStatus.className = "online-status";
      onlineStatus.style.marginLeft = "5px"; // Add some spacing
      onlineStatus.textContent = user.isActive ? "Online" : "Offline";
      onlineStatus.style.color = user.isActive ? "green" : "gray";
      isActive.push({ userId: user.id, isActive: user.isActive });
      const profilePic = document.createElement("img");
      profilePic.className = "profile-pic";
      if(user.profilePic.startsWith('/uploads/')){
        userItem.dataset.profilePic = user.profilePic;
        profilePic.src = user.profilePic;
      } else {
        userItem.dataset.profilePic = "/image/userIcon.jpg";
        profilePic.src = "/image/userIcon.jpg";
      }
      userInfo.appendChild(userName);
      userInfo.appendChild(onlineStatus);
      userItem.appendChild(profilePic);
      userItem.appendChild(userInfo);
      
      if(isSender){
        userListContainer.prepend(userItem)
      } else {
        userListContainer.appendChild(userItem);
      }
    });
    if (userList.groupList) {
      const seen = {};
      const uniqueArr = userList.groupList.filter((item) => {
        const key = `${item.name}_${item.type}_${item.createdBy}`;
        if (!seen[key]) {
          seen[key] = true;
          return true;
        }
        return false;
      });
      uniqueArr.forEach((user) => {
        const userListContainer = document.getElementById("userList");
        const userItem = document.createElement("div");
        userItem.className = "user-item";
        userItem.dataset.roomId = user.id;
        userItem.dataset.type = "multiple";
        userItem.dataset.profilePic = user.groupIcon;
        userItem.dataset.roomName = user.name;
        userItem.style.marginBlock = "5px";

        const userInfo = document.createElement("div");
        userInfo.className = "user-info";
        const profilePic = document.createElement("img");
        profilePic.className = "group-profile-pic";
        profilePic.src = user.groupIcon;
        // if(user.groupIcon.startsWith('/uploads/')){
        //   profilePic.src = user.groupIcon;
        // } else {
          //profilePic.src = "/image/people.png";
        // }
        const userName = document.createElement("span");
        userName.textContent = user.name.split("-")[0];

        userInfo.appendChild(userName);
        userItem.appendChild(profilePic);
        userItem.appendChild(userInfo);
        userListContainer.appendChild(userItem);
      });
    }
  }
  socket.on("user status", function (statusData) {
    // Update online status indicators when receiving a user status change
    const userItem = document.querySelector(
      `[data-user-id="${statusData.userId}"]`
    );
    if (userItem) {
      const onlineStatus = userItem.querySelector(".online-status");
      if (statusData.isOnline == true) {
        isActive.forEach((e) => {
          if (e.userId == statusData.userId) {
            e.isActive = true;
          }
        });
        onlineStatus.textContent = "Online";
        onlineStatus.style.color = "green";
      } else {
        isActive.forEach((e) => {
          if (e.userId == statusData.userId) {
            e.isActive = false;
          }
        });
        onlineStatus.textContent = "Offline";
        onlineStatus.style.color = "gray"; // Set the color to indicate offline status
      }
    }
  });

  document.addEventListener("click", function (event) {
    if (event.target && event.target.matches(".user-item")) {
      const allSpans = event.target.querySelectorAll("span");
      const clickedUserName = allSpans[0].textContent;
      const profilePic = event.target.dataset.profilePic;
      if (event.target.dataset.type == "multiple") {
        socket.emit("clicked user", {
          toUserId: event.target.dataset.roomId,
          roomName: event.target.dataset.roomName,
          createdBy: userId,
          popUp: true,
        });
      } else {
        socket.emit("clicked user", {
          toUserId: event.target.dataset.userId,
          roomName:
            event.target.dataset.toUserEmail + event.target.dataset.userId,
          createdBy: userId,
          popUp: false,
        });
      }
      openChatInterface(clickedUserName, profilePic);
    }
  });
  document
    .getElementById("chatSendButton")
    .addEventListener("click", function (e) {
      e.preventDefault();
      const image = document.getElementById("imageInput").files[0];
      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        formData.append("senderId", userId);
        formData.append("roomName", roomName);
        axios
          .post("http://localhost:8000/chat/upload-image", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((data) => {
            if (data.data.success) {
              let messageValue = document
                .getElementById("chatInput")
                .value.trim();
              socket.emit("chat message", {
                image: true,
                message: data.data.message.message,
                senderId: data.data.message.userId,
                roomName: roomName,
                status: "sent",
              });
              displaySentImage(data.data.message.message);
              const imageInput = document.getElementById("imageInput");
              imageInput.value = "";
              if (messageValue !== "") {
                socket.emit("chat message", {
                  roomName: roomName,
                  value: messageValue,
                  recipientId: recipientUserId,
                  senderId: userId,
                  status: "sent",
                });
                socket.on("sendedMsgImg", (messageId) => {
                  let msgStatus = "sent";
                  isActive.forEach((e) => {
                    if (e.isActive == true && recipientUserId == e.userId) {
                      msgStatus = "delivered";
                    }
                  });
                  displaySentMessage(messageValue, msgStatus, messageId);
                });
                document.getElementById("chatInput").value = "";
              }
            }
          })
          .catch((err) => {
            console.error("Error uploading file", err);
          });
      } else {
        let messageValue = document.getElementById("chatInput").value.trim();
        if (messageValue !== "") {
          socket.emit("chat message", {
            roomName: roomName,
            value: messageValue,
            recipientId: recipientUserId,
            senderId: userId,
            status: "sent",
          });
          socket.on("sendedMsg", (messageId) => {
            let msgStatus = "sent";
            isActive.forEach((e) => {
              if (e.isActive == true && recipientUserId == e.userId) {
                msgStatus = "delivered";
              }
            });
            displaySentMessage(
              messageId[0].message,
              msgStatus,
              messageId[0].id
            );
          });
          document.getElementById("chatInput").value = "";
        }
      }
    });

  // Image send feature
  document
    .getElementById("imageInput")
    .addEventListener("change", function (e) {
      if (e.target.files.length > 0) {
        document.getElementById("chatSendButton").style.display = "block";
      }
    });

  socket.on("receive message", function (data) {
    if (data.senderId != userId) {
      displayReceivedMessage(data.message, data.senderName);
    }
  });
  socket.on("previous messages", function (messages) {
    messages.forEach((message) => {
      if (message.userId == userId) {
        if (message.type == "media") {
          displaySentImage(message.message);
        } else {
          displaySentMessage(message.message, message.status, message.id);
        }
      } else {
        if (message.type == "media") {
          displayReceivedImage(message.message);
        } else {
          displayReceivedMessage(message.message, message.senderName);
        }
      }
    });
  });

  //Typing indication
  $(document).ready(function () {
    $("#chatInput").keypress((e) => {
      if (e.which != 13) {
        typing = true;
        socket.emit("typing", {
          user: username,
          roomName: roomName,
          typing: true,
        });
        clearTimeout(timeout);
        timeout = setTimeout(typingTimeout, 1000);
      } else {
        clearTimeout(timeout);
        typingTimeout();
      }
    });

    socket.on("display", (data) => {
      if (
        data.typing == true &&
        data.user != username &&
        data.roomName == roomName
      ) {
        $("#typing").text(`is typing...`);
      } else {
        $("#typing").text("");
      }
    });
  });

  function typingTimeout() {
    typing = false;
    socket.emit("typing", {
      user: username,
      roomName: roomName,
      typing: false,
    });
  }

  // Send image
  socket.on("receive image", function (data) {
    if (data.senderId !== userId) {
      displayReceivedImage(data.message);
    }
  });

  document
    .getElementById("groupNameInput")
    .addEventListener("input", enableCreateGroupButton);
  document
    .querySelectorAll('input[name="selectedUsers"]')
    .forEach(function (checkbox) {
      checkbox.addEventListener("change", enableCreateGroupButton);
    });

  // Open Popup
  function openUserSelectionPopup() {
    const userSelectionPopup = document.getElementById("userSelectionPopup");
    userSelectionPopup.style.display = "block";
    socket.emit("users", { userId: userId, popUp: true });
    socket.on("userListPopup", function (userList) {
      displayUserListInPopup(userList);
    });
  }

  //Close Popup
  function closeUserSelectionPopup() {
    const userSelectionPopup = document.getElementById("userSelectionPopup");
    userSelectionPopup.style.display = "none";
    document.getElementById("groupNameInput").value = "";
    document.getElementById("errorMsg").textContent = "";
  }

  //Display user list in popup
  function displayUserListInPopup(userList) {
    const userSelectionList = document.getElementById("userSelectionList");
    userSelectionList.innerHTML = "";

    userList.forEach((user) => {
      const userItem = document.createElement("div");
      userItem.className = "user-items";
      userItem.dataset.userId = user.id;
      userItem.dataset.toUserEmail = user.email;
      userItem.style.marginBlock = "5px";

      const userName = document.createElement("span");
      userName.textContent = user.firstName + " " + user.lastName;

      const selectUserCheckbox = document.createElement("input");
      selectUserCheckbox.type = "checkbox";
      selectUserCheckbox.name = "selectedUsers";
      selectUserCheckbox.value = user.id;

      userItem.appendChild(selectUserCheckbox);
      userItem.appendChild(userName);

      userSelectionList.appendChild(userItem);
    });
  }

  const groupButton = document.getElementById("groupIcon");
  groupButton.addEventListener("click", openUserSelectionPopup);

  const closeUserSelectionButton = document.getElementById(
    "closeSelectionPopup"
  );
  closeUserSelectionButton.addEventListener("click", closeUserSelectionPopup);

  const createGroupButton = document.getElementById("createGroupButton");
  createGroupButton.addEventListener("click", createGroup);

  // Create group function
  function createGroup() {
    const selectedUserIds = [];
    const selectedUserCheckboxes = document.querySelectorAll(
      'input[name="selectedUsers"]:checked'
    );
    selectedUserCheckboxes.forEach((checkbox) => {
      selectedUserIds.push(checkbox.value);
    });
    const groupNameInput = document.getElementById("groupNameInput");
    const groupName = groupNameInput.value.trim();

    if (groupName !== "" && selectedUserIds.length > 0) {
      socket.emit("clicked user", {
        toUserId: selectedUserIds,
        roomName: groupName + "-" + userId + "-" + Date.now(),
        createdBy: userId,
        popUp: true,
      });
      socket.on("send data", function (data) {
        recipientUserId = data.toUserId;
        roomName = data.roomName;
        const userListContainer = document.getElementById("userList");
        const userItem = document.createElement("div");
        userItem.className = "user-item";
        userItem.dataset.roomId = data.roomId;
        userItem.dataset.type = "multiple";
        userItem.style.marginBlock = "5px";

        const profilePic = document.createElement("div");
        profilePic.className = "group-profile-pic";
        const userInfo = document.createElement("div");
        userInfo.className = "user-info";
        const userName = document.createElement("span");
        userName.textContent = groupName;

        userInfo.appendChild(userName);
        userItem.appendChild(profilePic);
        userItem.appendChild(userInfo);
        userListContainer.appendChild(userItem);
      });
      closeUserSelectionPopup();
    } else {
      const userList = document.getElementById("user-list-content");
      const errorMsg = document.createElement("div");
      errorMsg.id = "errorMsg";
      errorMsg.textContent =
        "Please enter a group name and select at least one user.";
      errorMsg.style.color = "red";
      userList.appendChild(errorMsg);
    }
  }

  // Enable create group function
  function enableCreateGroupButton() {
    const createGroupButton = document.getElementById("createGroupButton");
    const groupNameInput = document.getElementById("groupNameInput");
    const selectedUserCheckboxes = document.querySelectorAll(
      'input[name="selectedUsers"]:checked'
    );

    if (
      selectedUserCheckboxes.length > 0 &&
      groupNameInput.value.trim() !== ""
    ) {
      createGroupButton.removeAttribute("disabled");
    } else {
      createGroupButton.setAttribute("disabled", "true");
    }
  }

  // Open the chat interface
  function openChatInterface(userName, profilePic) {
    clearChatMessages();
    document.getElementById("chatInterface").style.display = "flex";
    if (profilePic.startsWith("/uploads/")) {
      document.querySelector("#profilePic").src = profilePic;
    } else {
      document.querySelector("#profilePic").src = profilePic
    }
    const newHeader = document.getElementById('newHeader')
    const imageContainer = document.createElement('div')
    imageContainer.id = "modal-container-profile"
    imageContainer.className = "modal-container-profile";
    const span = document.createElement("span");
    span.className = "closeProfileImageBtn";
    span.onclick = closeModal;
    span.textContent = "x";
    const enlargeImage = document.createElement("img");
    enlargeImage.alt = "Enlarged-Image";
    enlargeImage.id = "enlarged-image-profile";
    imageContainer.appendChild(span)
    imageContainer.appendChild(enlargeImage)
    newHeader.appendChild(imageContainer)
    const getImage = document.querySelector("#profilePic")
    getImage.onclick = function() {   
      openModal(getImage.src)
    }
    document.getElementById("chatHeader").innerText = userName;
    socket.off("send data");
    socket.on("send data", function (data) {
      recipientUserId = data.toUserId;
      roomName = data.roomName;
      socket.emit("get messages", {
        roomName: data.roomName,
        senderId: userId,
      });
    });

    scrollToBottom();
  }

  //Display send Image
  function displaySentImage(image) {
    const imageElement = document.createElement("img");
    imageElement.src = image;
    imageElement.className = "sent-image";
    imageElement.onclick = function () {
      openModal(image);
    };

    const messageDiv = document.createElement("div");
    messageDiv.className = "message me";

    const modelContainer = document.createElement("div");
    modelContainer.id = "modal-container";
    modelContainer.className = "modal-container";

    const span = document.createElement("span");
    span.className = "closeImageBtn";
    span.onclick = closeModal;
    span.textContent = "x";

    const enlargeImage = document.createElement("img");
    enlargeImage.alt = "Enlarged Image";
    enlargeImage.id = "enlarged-image";

    modelContainer.appendChild(span);
    modelContainer.appendChild(enlargeImage);
    messageDiv.appendChild(modelContainer);
    messageDiv.appendChild(imageElement);
    document.getElementById("chatMessages").appendChild(messageDiv);
    scrollToBottom();
  }

  //Display receive Image
  function displayReceivedImage(image) {
    const imageElement = document.createElement("img");
    imageElement.src = image;
    imageElement.className = "receive-image";
    imageElement.onclick = function () {
      openModal(image);
    };

    const messageDiv = document.createElement("div");
    messageDiv.className = "message you";

    const modelContainer = document.createElement("div");
    modelContainer.id = "modal-container";
    modelContainer.className = "modal-container";

    const span = document.createElement("span");
    span.className = "closeImageBtn";
    span.onclick = closeModal;
    span.textContent = "x";

    const enlargeImage = document.createElement("img");
    enlargeImage.alt = "Enlarged Image";
    enlargeImage.id = "enlarged-image";

    modelContainer.appendChild(span);
    modelContainer.appendChild(enlargeImage);
    messageDiv.appendChild(modelContainer);
    messageDiv.appendChild(imageElement);
    document.getElementById("chatMessages").appendChild(messageDiv);
    scrollToBottom();
  }

  function displaySentMessage(message, status, messageId) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message me";
    messageDiv.id = "message me";
    messageDiv.innerHTML = `
    <div class="content" id="content">
    <h1>${username}</h1>
    <div class="blueTickDiv" id="blueTickDiv">
    <p>${message}</p>
    <img src="${
      status == "sent"
        ? "/image/check.png"
        : status == "delivered"
        ? "/image/read.png"
        : "/image/double-check.png"
    }" id="Read_Recipient" alt="Read_Recipient" style="margin-top:12px; margin-left:5px; height:10px; width:10px">
    </div>
    </div>
    <p class="time">${moment().format("hh:mm")}</p>`;
    messageDiv.dataset.messageId = messageId;
    document.getElementById("chatMessages").appendChild(messageDiv);
    removeDuplicate();
    scrollToBottom();
  }

  function removeDuplicate() {
    const container = document.getElementById("chatMessages");
    const elements = Array.from(container.children);
    const uniqueElements = [];
    elements.forEach((element) => {
      const elementContent = element.textContent;
      if (element.innerHTML.startsWith("<img")) {
        uniqueElements.push(element);
      }
      const isDuplicate = uniqueElements.some((uniqueElement) => {
        return uniqueElement.textContent === elementContent;
      });
      if (!isDuplicate) {
        uniqueElements.push(element);
      }
    });
    container.innerHTML = "";
    uniqueElements.forEach((uniqueElement) => {
      container.appendChild(uniqueElement);
    });
  }
  // Display received message in the chat interface
  function displayReceivedMessage(message, senderName) {
    // Create and append the message element
    const messageDiv = document.createElement("div");
    messageDiv.className = "message you";
    let userName = senderName
      ? senderName
      : document.getElementById("chatHeader").innerText;
    messageDiv.innerHTML = `
  <div class="content">
    <h1>${userName}</h1>
    <p>${message}</p>
  </div>
  <p class="time">${moment().format("hh:mm")}</p>
`;
    document.getElementById("chatMessages").appendChild(messageDiv);
    scrollToBottom();
  }
  function openModal(image) {
    const enlargeImage = document.getElementById("enlarged-image");
    if(enlargeImage){
      enlargeImage.src = image;
      document.getElementById("modal-container").style.display = "block";
    } else {
      const largeImage = document.getElementById('enlarged-image-profile')
      largeImage.src = image
      document.getElementById("chatMessages").style.display = "none"
      document.getElementById("modal-container-profile").style.display = "block"
    }
  }
  function closeModal() {
    const model =  document.getElementById("modal-container")
    if (model) {
      model.style.display = "none";
    } else {
      document.getElementById("chatMessages").style.display = "block"
      document.getElementById("modal-container-profile").style.display = "none";
    }
  }
  // Scroll to the bottom of the chat messages
  function scrollToBottom() {
    const chatMessagesDiv = document.getElementById("chatMessages");
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
  }
  function clearChatMessages() {
    const chatMessagesDiv = document.getElementById("chatMessages");
    while (chatMessagesDiv.firstChild) {
      chatMessagesDiv.removeChild(chatMessagesDiv.firstChild);
    }
  }
});
