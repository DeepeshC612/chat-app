const Router = require("express").Router();
const address = require('../controllers/addressControllers');

Router.post('/:id', address.addAddress)
Router.get('/search', address.searchAndFilter)

module.exports = Router
