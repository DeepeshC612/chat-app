module.exports = (sequelize, DataTypes) => {
const Address = sequelize.define("Address", {
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    // set(value) {
    //   this.setDataValue("address", upperCase(value));
    // },
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
    // get(){
    //   this.getDataValue('address')
    // }
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Address.associate = (models) => {
  Address.belongsTo(models.User, {
    foreignKey: 'UserId',
  });
};
// Address.addScope("city", {
//   where: {
//     city: "indore",
//   },
// });

return Address
}