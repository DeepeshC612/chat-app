const Router = require("express").Router();
const address = require("../controllers/addressControllers");
const {
  authenticate,
  resourceAccessMiddleware,
} = require("../middlewares/authMiddleware");

Router.post(
  "/",
  authenticate,
  resourceAccessMiddleware(["user", "admin"]),
  address.addAddress
);
Router.get(
  "/search",
  authenticate,
  resourceAccessMiddleware(["user", "admin"]),
  address.searchAndFilter
);
Router.get(
  "/search/list",
  authenticate,
  resourceAccessMiddleware(["user", "admin"]),
  address.findOneAddress
);
Router.patch(
  "/default/:id",
  authenticate,
  resourceAccessMiddleware(["user", "admin"]),
  address.changeDefaultAddress
);
Router.post(
  "/addDefault",
  authenticate,
  resourceAccessMiddleware(["user", "admin"]),
  address.addDefaultAddress
);

module.exports = Router;
