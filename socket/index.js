const {
  addNewGroup,
  saveMessages,
  userList,
  userOnlineStatus,
  getMessages,
  getGroup,
  getRoomMessages,
} = require("../controllers/chatControllers");

let room = {};
let socket = (server) => {
  const io = require("socket.io")(server, {
    pingInterval: 1000,
    pingTimeout: 5000,
  });

  io.on("connection", function (socket) {
    socket.on("users", async (data) => {
      try {
        const usersList = await userList(data);
        const groupList = await getGroup(data);
        if (usersList) {
          if (data.popUp) {
            socket.emit("userListPopup", usersList);
          } else {
            if (groupList.length) {
              socket.emit("user list", {
                userList: usersList,
                groupList: groupList,
              });
            } else {
              socket.emit("user list", { userList: usersList });
            }
          }
          usersList.forEach(async (e) => {
            let msg = await getRoomMessages({ userId: data.userId, id: e.id, isActive: e.isActive });
          });
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
          popUp: data.popUp,
        };
        // Save user info to database
        const newGroup = await addNewGroup(userData);
        if (newGroup) {
          room.roomName = newGroup.name;
          socket.join(newGroup.name);
          // Send user information to the client
          socket.emit("send data", {
            toUserId: data.toUserId,
            roomName: newGroup.name,
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
      const messages = await getMessages(data);
      socket.emit("previous messages", messages);
    });

    socket.on("chat message", async (data) => {
      try {
        if (data.image) {
          io.to(data.roomName).emit("receive image", {
            message: data.message,
            senderId: data.senderId,
          });
          io.emit("sortUserListImage", {
            senderId: data.senderId,
          })
        } else {
          const res = await saveMessages(data);
          if (res.result) {
            socket.emit("sendedMsgImg", res.result.id);
            socket.emit("sendedMsg", res.result);
            // Broadcast the message to everyone in the room
            io.emit("sortUserList", {
              senderId: data.senderId,
            })
            io.to(data.roomName).emit("receive message", {
              message: data.value,
              senderId: data.senderId,
              recipientIds: res.ids,
              senderName: res.senderName,
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
        // });
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
