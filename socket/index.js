const {
  addNewGroup,
  saveMessages,
  userList,
  userOnlineStatus,
  getMessages,
} = require("../controllers/chatControllers");


let socket = (server) => {
  const io = require("socket.io")(server, {
    pingInterval: 1000,
    pingTimeout: 5000,
  });

  io.on("connection", function (socket) {
    socket.on("users", async (data) => {
      try {
        const usersList = await userList(data);
        if (usersList) {
          if(data.popUp){
            socket.emit("userListPopup", usersList);
          } else {
            socket.emit("user list", usersList);
          }
          socket.userId = data.userId;
          await userOnlineStatus(data.userId, true);
          io.emit("user status", {
            userId: data.userId,
            isOnline: true,
          });
        }
      } catch (err) {
        throw new Error(err);
      }
    });
    socket.on("clicked user", async (data) => {
      try {
        let userData = {
          name: data.roomName,
          toUserId: data.toUserId,
          createdBy: data.createdBy,
          popUp: data.popUp
        };
        // Save user info to database
        const newGroup = await addNewGroup(userData);
        console.log("newGroup", newGroup)
        if (newGroup) {
          socket.join(newGroup.name);
          // Send user information to the client
          socket.emit("send data", {
            toUserId: data.toUserId,
            roomName: newGroup.name,
            roomId: newGroup.id,
            createdBy: data.createdBy,
          });
        }
      } catch (err) {
        console.log(err);
      }
    });

    socket.on("typing", (data) => {
      if (data.typing == true) {
        io.to(data.roomName).emit("display", data);
      } else {
        io.to(data.roomName).emit("display", data);
      }
    });

    socket.on("get messages", async (data) => {
      // Retrieve messages from the database based on roomName and senderId
      const messages = await getMessages(data);
      socket.emit("previous messages", messages);
    });

    socket.on("chat message", async (data) => {
      try {
        if(data.image){
          io.to(data.roomName).emit("receive image", {
            message: data.message,
            senderId: data.senderId,
          });
        } else {
          const result = await saveMessages(data);
          if (result) {
            // Broadcast the message to everyone in the room
            io.to(data.roomName).emit("receive message", {
              message: data.value,
              senderId: data.senderId,
            });
          }
        }
      } catch (err) {
        throw new Error(err);
      }
    });

    socket.on("disconnect", async () => {
      console.log("A user disconnected");
      const disconnectedClient = socket.userId;
      if (disconnectedClient) {
        await userOnlineStatus(disconnectedClient, false);
        socket.broadcast.emit("user status", {
          userId: disconnectedClient,
          isOnline: false,
        });
        socket.leave(socket.id);
      }
    });
  });

  /**
   * Get index from socketId
   * @param {string} socketId
   */
  function getIndexBySocketId(socketId) {
    return clients.findIndex((user) => {
      return user.socketId == socketId;
    });
  }

  /**
   * remove user from socket
   * @param {object} socket
   */
  function removeUser(socket) {
    try {
      let clientIndex = getIndexBySocketId(socket.id);
      if (clientIndex !== -1) {
        clients.splice(clientIndex, 1);
      }
      socket.leave(socket.id);
    } catch (err) {
      console.log(err);
    }
  }
};

module.exports = socket;
