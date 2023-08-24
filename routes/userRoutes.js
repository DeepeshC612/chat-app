const Router = require("express").Router();
const user = require("../controllers/userControllers");
const upload = require("../middlewares/multiStoreMiddleware");
const {
  LoginUserValidation,
  registerUserValidation,
} = require("../validation/user/userValidation");
const auth = require("../middlewares/authMiddleware");

Router.post(
  "/signup",
  upload.single("profilePic"),
  registerUserValidation,
  user.signUp
);
Router.post("/login", LoginUserValidation, user.logIn);
Router.post("/email-reset-password", user.emailForResetPass);
Router.post("/forgot-password/:id", user.forgotPassword);
Router.post("/change-password", auth.authenticate, user.changePassword);

module.exports = Router;
