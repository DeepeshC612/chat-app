const Router = require("express").Router();
const user = require("../controllers/userControllers");
const upload = require("../middlewares/multiStoreMiddleware");
const validate = require("../validation/user/userValidation")
const auth = require('../middlewares/authMiddleware')

Router.post(
    "/signup",
    upload.single("profilePic"),
    validate.registerUserValidation,
    user.signUp
);
Router.post(
    "/login",
    validate.LoginUserValidation,
    auth.isUserLogin,
    user.logIn
);
Router.post(
    "/email-reset-password",
    auth.isUserLogin,
    user.emailForResetPass
);
Router.post(
    "/forgot-password/:id",
    user.forgotPassword
);
Router.post(
    "/change-password",
    auth.authenticate,
    user.changePassword
);


module.exports = Router