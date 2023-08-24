/* eslint-disable global-require */
const fs = require("fs");
const Sequelize = require("sequelize");
const path = require("path");
require('dotenv').config()

const db = {};
// let sequelize;
const sequelize = new Sequelize(process.env.DATABASE, process.env.USER, process.env.PASS, {
  host: process.env.HOST,
  logging: false,
  dialect: "mysql",
});

fs.readdirSync(__dirname)
  .filter((file) => file.indexOf(".") !== 0 && file !== "index.js")
  .forEach((file) => {
    // eslint-disable-next-line import/no-dynamic-require
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
  if (db[modelName].seedData) {
    db[modelName].seedData(config);
  }
  if (db[modelName].loadScopes) {
    db[modelName].loadScopes(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
