const Router = require("express").Router();
const user = require("../controllers/userControllers");
const upload = require("../middlewares/multiStoreMiddleware");
const validate = require("../validation/user/userValidation")

Router.post(
    "/signup",
    upload.single("profilePic"),
    validate.registerUserValidation,
    user.signUp
);
Router.post(
    "/login",
    validate.LoginUserValidation,
    user.logIn
);


module.exports = Router