const Router = require("express").Router();
const admin = require("../controllers/adminControllers");
const auth = require("../middlewares/authMiddleware");

Router.post(
    "/login",
    auth.isAdminLogin,
    admin.adminLogin
);
Router.get(
    "/address/list",
    auth.authenticate,
    auth.isAdmin,
    admin.listAllAddress
);

module.exports = Router;
