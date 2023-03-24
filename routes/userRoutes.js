const Router = require("express").Router();
const user = require("../controllers/userControllers");
const upload = require("../middlewares/multiStoreMiddleware");

Router.post(
    "/signup",
    upload.single("profilePic"),
    user.signUp
);
Router.post(
    "/login",
    user.logIn
);


module.exports = Router