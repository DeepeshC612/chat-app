document.addEventListener("DOMContentLoaded", function () {
  var socket = io();
  let username = localStorage.getItem("name");
  let userId = localStorage.getItem("id");
  let recipientUserId;
  let roomName;
  var typing = false;
  var online = true;
  var timeout = undefined;

  socket.emit("users", { userId: userId });
  socket.on("user list", function (userList) {
    displayUserList(userList);
  });

  function displayUserList(userList) {
    const userListContainer = document.getElementById("userList");
    userListContainer.innerHTML = "";

    userList.forEach((user) => {
      const userItem = document.createElement("div");
      userItem.className = "user-item";
      userItem.dataset.userId = user.id;
      userItem.dataset.toUserEmail = user.email;
      userItem.style.marginBlock = "5px";

      const onlineStatus = document.createElement("span");
      onlineStatus.className = "online-status";
      onlineStatus.style.marginLeft = "5px"; // Add some spacing
      onlineStatus.textContent = user.isActive ? "Online" : "Offline";
      onlineStatus.style.color = user.isActive ? "green" : "gray";

      const userName = document.createElement("span");
      userItem.textContent = user.firstName + " " + user.lastName;

      userItem.appendChild(userName);
      userItem.appendChild(onlineStatus);

      userListContainer.appendChild(userItem);
    });
  }

  socket.on("user status", function (statusData) {
    // Update online status indicators when receiving a user status change
    const userItem = document.querySelector(
      `[data-user-id="${statusData.userId}"]`
    );
    if (userItem) {
      const onlineStatus = userItem.querySelector(".online-status");
      if (statusData.isOnline == true) {
        onlineStatus.textContent = "Online";
        onlineStatus.style.color = "green"; // Set the color to indicate online status
      } else {
        onlineStatus.textContent = "Offline";
        onlineStatus.style.color = "gray"; // Set the color to indicate offline status
      }
    }
  });

  document.addEventListener("click", function (event) {
    if (event.target && event.target.matches(".user-item")) {
      const clickedUserName = event.target.firstChild.textContent;
      socket.emit("clicked user", {
        toUserId: event.target.dataset.userId,
        roomName:
          event.target.dataset.toUserEmail + event.target.dataset.userId,
        createdBy: userId,
      });
      openChatInterface(clickedUserName);
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
              let messageValue = document.getElementById("chatInput").value.trim();
              socket.emit("chat message", {
                image: true,
                message: data.data.message.message,
                senderId: data.data.message.userId,
                roomName: roomName,
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
                });
                displaySentMessage(messageValue);
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
          });
          displaySentMessage(messageValue);
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
    if (data.senderId === recipientUserId) {
      displayReceivedMessage(data.message);
    }
  });
  socket.on("previous messages", function (messages) {
    messages.forEach((message) => {
      if (message.userId == userId) {
        if (message.type == "media") {
          displaySentImage(message.message);
        } else {
          displaySentMessage(message.message);
        }
      } else if (message.userId == recipientUserId) {
        if (message.type == "media") {
          displayReceivedImage(message.message);
        } else {
          displayReceivedMessage(message.message);
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
    if (data.senderId === recipientUserId) {
      displayReceivedImage(data.message);
    }
  });

  // Open the chat interface
  function openChatInterface(userName) {
    clearChatMessages();
    document.getElementById("chatInterface").style.display = "flex";
    document.getElementById("chatHeader").innerText = userName;
    socket.on("send data", function (data) {
      recipientUserId = data.toUserId;
      roomName = data.roomName;
      socket.emit("get messages", {
        roomName: data.roomName,
        senderId: userId,
      });
    });
  }

  //Display send Image
  function displaySentImage(image) {
    const imageElement = document.createElement("img");
    imageElement.src = image;
    imageElement.className = "sent-image";
    const messageDiv = document.createElement("div");
    messageDiv.className = "message me";

    messageDiv.appendChild(imageElement);
    document.getElementById("chatMessages").appendChild(messageDiv);
    scrollToBottom();
  }

  //Display receive Image
  function displayReceivedImage(image) {
    const imageElement = document.createElement("img");
    imageElement.src = image;
    imageElement.className = "receive-image";
    const messageDiv = document.createElement("div");
    messageDiv.className = "message you";

    messageDiv.appendChild(imageElement);
    document.getElementById("chatMessages").appendChild(messageDiv);
    scrollToBottom();
  }

  function displaySentMessage(message) {
    // Create and append the message element
    const messageDiv = document.createElement("div");
    messageDiv.className = "message me";
    messageDiv.innerHTML = `
  <div class="content">
    <h1>${username}</h1>
    <p>${message}</p>
  </div>
  <p class="time">${moment().format("hh:mm")}</p>
`;
    document.getElementById("chatMessages").appendChild(messageDiv);
    scrollToBottom();
  }

  // Display received message in the chat interface
  function displayReceivedMessage(message) {
    // Create and append the message element
    const messageDiv = document.createElement("div");
    messageDiv.className = "message you";
    messageDiv.innerHTML = `
  <div class="content">
    <h1>${document.getElementById("chatHeader").innerText}</h1>
    <p>${message}</p>
  </div>
  <p class="time">${moment().format("hh:mm")}</p>
`;
    document.getElementById("chatMessages").appendChild(messageDiv);
    scrollToBottom();
  }
  // Scroll to the bottom of the chat messages
  function scrollToBottom() {
    const chatMessagesDiv = document.getElementById("chatMessages");
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
  }
  function clearChatMessages() {
    const chatMessagesDiv = document.getElementById("chatMessages");
    chatMessagesDiv.innerHTML = ""; // Clear the messages
  }
});