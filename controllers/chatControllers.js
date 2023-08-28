const models = require("../models/index");
const { Group, GroupMessage, User, Sequelize } = models;
const { Op } = require("sequelize");

const userList = async (data) => {
  try {
    const id = data.userId;
    const isUserExist = await User.findAll({ where: { id: { [Op.ne]: id } } });
    if (isUserExist) {
      return isUserExist;
    } else {
      throw new Error();
    }
  } catch (err) {
    throw new Error(err);
  }
};
const addNewGroup = async (data) => {
  try {
    let isGroupExists;
    if (data.popUp) {
      isGroupExists = await Group.findAll({
        where: { name: data.name },
      });
    } else {
      isGroupExists = await Group.findAll({
        where: {
          [Op.and]: [
            { createdBy: { [Op.or]: [data.createdBy, data.toUserId] } },
            { toUserId: { [Op.or]: [data.createdBy, data.toUserId] } },
          ],
        },
      });
    }
    if (isGroupExists.length) {
      let roomName;
      isGroupExists.forEach((e) => {
        roomName = e.dataValues.name;
      });
      return roomName;
    } else {
      delete data.popUp
      const newGroup = await Group.create(data);
      if (newGroup) {
      return newGroup.name;
      } else {
        throw new Error();
      }
    }
  } catch (err) {
    throw new Error(err);
  }
};
const saveMessages = async (data) => {
  try {
    const findGroup = await Group.findOne({
      where: { name: data.roomName },
    });
    if (findGroup) {
      let message = {
        userId: data.senderId,
        groupId: findGroup.id,
        message: data.value,
      };
      const result = await GroupMessage.create(message);
      if (!result) {
        throw new Error();
      }
      return result;
    }
  } catch (err) {
    throw new Error(err);
  }
};

const userOnlineStatus = async (data, query) => {
  try {
    const result = await User.update(
      { isActive: query ? true : false },
      { where: { id: data } }
    );
    if (result) {
      const findUser = await User.findAll({ where: { id: data } });
      return findUser;
    } else {
      throw new Error();
    }
  } catch (err) {
    throw new Error(err);
  }
};

const getMessages = async (data) => {
  try {
    const findGroup = await Group.findOne({
      where: { name: data.roomName },
    });
    if (findGroup) {
      const result = await GroupMessage.findAll({
        where: { groupId: findGroup.dataValues.id },
      });
      if (!result) {
        throw new Error();
      }
      return result;
    }
  } catch (err) {
    throw new Error(err);
  }
};

const uploadImage = async (req, res) => {
  if (!req.file) {
    res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }
  const imagePath = "/uploads/" + req.file.filename;
  try {
    const findGroup = await Group.findOne({
      where: { name: req.body.roomName },
    });
    if (findGroup) {
      let message = {
        type: "media",
        userId: req.body.senderId,
        groupId: findGroup.id,
        message: imagePath,
      };
      const result = await GroupMessage.create(message);
      if (!result) {
        throw new Error();
      }
      res.status(200).json({
        success: true,
        message: result,
      });
    }
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  addNewGroup,
  saveMessages,
  getMessages,
  userList,
  uploadImage,
  userOnlineStatus,
};
