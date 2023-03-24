const Router = require("express").Router();
const address = require('../controllers/addressControllers');

Router.post('/:id', address.addAddress)

module.exports = Router
