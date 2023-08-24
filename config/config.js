require("dotenv").config();

module.exports = {
  development: {
    username: process.env.USER,
    password: process.env.PASS,
    database: process.env.DATABASE,
    host: process.env.HOST,
    dialect: "mysql",
  },
  test: {
    username: process.env.USER,
    password: process.env.PASS,
    database: process.env.DATABASE,
    host: process.env.HOST,
    dialect: "mysql",
  },
  production: {
    username: process.env.USER,
    password: process.env.PASS,
    database: process.env.DATABASE,
    host: process.env.HOST,
    dialect: "mysql",
  },
};
