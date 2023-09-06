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
        where: { name: data.name, type: 'multiple' },
      });
    } else {
      isGroupExists = await Group.findAll({
        where: {
          [Op.and]: [
            { type: 'single' },
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
      if (Array.isArray(data.toUserId)) {
        let newGroup;
        for (const toUserId of data.toUserId) {
          let userData = {
            name: data.name,
            toUserId: toUserId,
            createdBy: data.createdBy,
            type: "multiple",
          };
          newGroup = await Group.create(userData);
        }
        if (newGroup) {
          return newGroup;
        }
      } else {
        delete data.popUp;
        const newGroup = await Group.create(data);
        if (newGroup) {
          return newGroup;
        }
      }
    }
  } catch (err) {
    throw new Error(err);
  }
};
const getGroup = async (data) => {
  try {
      const groupList = await Group.findAll({
        where: {
          type: "multiple",
          [Op.or]: [{ createdBy: data.userId }, { toUserId: data.userId }],
        },
      });
      if(groupList){
        return groupList
      } else {
        throw new Error()
      }
  } catch (err) {
    throw new Error(err);
  }
};
const saveMessages = async (data) => {
  try {
    const findGroup = await Group.findAll({
      where: { name: data.roomName },
    });
    let ids =[];
    if (findGroup.length) {
      findGroup.forEach((e)=>{
        if(e.type == "multiple"){
          ids.push(e.toUserId)
        }
      })
      let message = {
        userId: data.senderId,
        groupId: findGroup[0].id,
        message: data.value,
      };
      const result = await GroupMessage.create(message);
      if (!result) {
        throw new Error();
      }
      return {result: result, ids: ids};
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
      } else {
        throw new Error();
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
  getGroup
};
