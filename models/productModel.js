// const { DataTypes } = require("sequelize");
// const { sequelize } = require("../models/index");
// const User = require("./userModel");

module.exports = (sequelize, DataTypes) => {
const Product = sequelize.define("Product", {
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // productImage: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

// User.hasMany(Product);
// Product.belongsTo(User, {
//   foreignKey: "UserId",
//   as: "product",
// });
// sequelize.sync();

return Product;
}
