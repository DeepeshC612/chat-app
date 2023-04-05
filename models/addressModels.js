const { DataTypes } = require("sequelize");
const { sequelize } = require("../models/index");

const upperCase = (str) => {
  let newStr = str.split("");
  newStr[0] = newStr[0].toUpperCase();
  return newStr.join("");
};

const Address = sequelize.define("address", {
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      this.setDataValue("address", upperCase(value));
    },
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
    get(){
      this.getDataValue('address')
    }
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Address.addScope("city", {
  where: {
    city: "indore",
  },
});

module.exports = Address;
