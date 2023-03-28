const Router = require("express").Router();
const address = require("../controllers/addressControllers");
const auth = require("../middlewares/authMiddleware");

Router.post("/", auth.authenticate, address.addAddress);
Router.get("/search", auth.authenticate, address.searchAndFilter);
Router.patch("/default/:id", auth.authenticate, address.changeDefaultAddress);

module.exports = Router;
