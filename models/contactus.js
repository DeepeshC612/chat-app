module.exports = (sequelize, DataTypes) => {
    const ContactUs = sequelize.define("ContactUs", {
      title: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.STRING,
      },
      videoLink: {
        type: DataTypes.STRING
      }
    });
    
    // Address.associate = (models) => {
    //   Address.belongsTo(models.User, {
    //     foreignKey: 'UserId',
    //   });
    // };
    // Address.addScope("city", {
    //   where: {
    //     city: "indore",
    //   },
    // });
    
    return ContactUs
    }