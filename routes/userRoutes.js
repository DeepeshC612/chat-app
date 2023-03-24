const Router = require("express").Router();
const user = require("../controllers/userControllers");

Router.post(
    "/signup",
    user.signUp
);

module.exports = Router