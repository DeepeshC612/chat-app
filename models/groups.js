module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define("Group", {
    name: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.ENUM('single', 'multiple'),
      defaultValue: 'single'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'deleted'),
      defaultValue: 'active'
    },
    toUserId: {
      type: DataTypes.INTEGER,
    },
    createdBy: {
      type: DataTypes.INTEGER,
    }
  });

  Group.associate = (models) => {
    Group.belongsTo(models.User, {
      foreignKey: "toUserId",
    });
    Group.belongsTo(models.User, {
      foreignKey: "createdBy",
    });
    Group.hasMany(models.GroupMessage, {
      foreignKey: "groupId",
    });
  };

  return Group;
};
