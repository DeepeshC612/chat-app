const { DataTypes } = require("sequelize");
const { sequelize } = require("../models/index");
const User = require("./userModel");

const Product = sequelize.define("product", {
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  productImage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

User.hasMany(Product);
Product.belongsTo(User, {
  foreignKey: "UserId",
  as: "product",
});
sequelize.sync();

module.exports = Product;
