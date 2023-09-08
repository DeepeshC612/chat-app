module.exports = (sequelize, DataTypes) => {
  const GroupMessage = sequelize.define(
    "GroupMessage",
    {
      groupId: {
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      message: {
        type: DataTypes.TEXT,
      },
      type: {
        type: DataTypes.ENUM('text', 'media'),
        defaultValue: 'text'
      },
      status: {
        type: DataTypes.ENUM('sent', 'delivered', 'seen'),
      }
    },
    {
      underscored: true,
    }
  );

  GroupMessage.associate = (models) => {
    GroupMessage.belongsTo(models.User, {
      foreignKey: "userId",
    });
    GroupMessage.belongsTo(models.Group, {
      foreignKey: "groupId",
    });
  };

  return GroupMessage;
};
