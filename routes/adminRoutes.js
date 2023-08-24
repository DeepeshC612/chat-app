const Router = require("express").Router();
const admin = require("../controllers/adminControllers");
const {
  resourceAccessMiddleware,
  authenticate,
} = require("../middlewares/authMiddleware");

Router.post("/login", admin.adminLogin);
Router.get(
  "/address/list",
  authenticate,
  resourceAccessMiddleware(["admin"]),
  admin.listAllAddress
);
Router.get(
  "/pdf/get",
  admin.generateInvoice
);
Router.get(
  "/contact/get",
  admin.contactUs
);
Router.post(
  "/contact",
  admin.contactUsCreate
);
Router.delete(
  "/address/delete/:id",
  authenticate,
  resourceAccessMiddleware(["admin"]),
  admin.removeAddress
);
Router.patch(
  "/address/update/:id",
  authenticate,
  resourceAccessMiddleware(["admin"]),
  admin.editAddress
);

module.exports = Router;
