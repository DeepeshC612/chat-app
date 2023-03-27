const { DataTypes } = require("sequelize");
const { sequelize } = require("../models/index");

const Address = sequelize.define("address", {
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Address;
