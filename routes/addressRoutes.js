const Router = require("express").Router();
const address = require("../controllers/addressControllers");
const auth = require("../middlewares/authMiddleware");

Router.post("/", auth.authenticate, address.addAddress);
Router.get("/search", address.searchAndFilter);
Router.patch("/default", address.changeDefaultAddress);

module.exports = Router;
