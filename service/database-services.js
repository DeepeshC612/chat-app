const models = require("../models/index");

function establishDbConnection() {
  const { sequelize } = models;
  sequelize
    .authenticate()
    .then(async () => {
      console.log("Database connected successfully");
      await sequelize.sync();
    })
    .catch((error) => {
      console.log("connection", { error });
      console.log("Database connection error %s", error);
    });
}

module.exports = establishDbConnection;
