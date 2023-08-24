// const { DataTypes } = require("sequelize");
// const { sequelize } = require("../models/index");
// const Address = require("./addressModels");
module.exports = (sequelize, DataTypes) => {
const User = sequelize.define("User", {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneNum: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profilePic: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userRole:{
    type: DataTypes.ENUM('user', 'admin'),
    default: null,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

User.associate = (models) => {
  User.hasMany(models.Address, {
    foreignKey: 'UserId',
  });
  User.hasMany(models.Group, {
    foreignKey: 'toUserId',
  });
  User.hasMany(models.Group, {
    foreignKey: 'createdBy',
  });
  User.hasMany(models.GroupMessage, {
    foreignKey: 'userId',
  });
};

// User.hasMany(Address);
// Address.belongsTo(User, {
//   foreignKey: "UserId",
//   as: "userAddress",
// });


return User;
}
