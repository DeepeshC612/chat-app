const Router = require("express").Router();
const admin = require("../controllers/adminControllers");
const auth = require("../middlewares/authMiddleware");

Router.post(
    "/login",
    auth.isUserLogin,
    admin.adminLogin
);
Router.get(
    "/address/list",
    auth.authenticate,
    auth.isAdmin,
    admin.listAllAddress
);
Router.delete(
    "/address/delete/:id",
    auth.authenticate,
    auth.isAdmin,
    admin.removeAddress
);
Router.patch(
    "/address/update/:id",
    auth.authenticate,
    admin.editAddress
);

module.exports = Router;
