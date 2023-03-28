const { DataTypes } = require("sequelize");
const { sequelize } = require("../models/index");
const Address = require("./addressModels");

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
    type: DataTypes.STRING,
    allowNull:false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

User.hasMany(Address);
Address.belongsTo(User, {
  foreignKey: "UserId",
  as: "userAddress",
});
sequelize.sync();

module.exports = User
