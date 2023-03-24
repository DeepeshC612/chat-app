const { Sequelize } = require("sequelize");
const { configData } = require('../config/config');

const sequelize = new Sequelize(
  configData.DatabaseName,
  configData.username,
  configData.password,
  {
    host: configData.host,
    dialect: configData.dialect,
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

module.exports = { sequelize };
