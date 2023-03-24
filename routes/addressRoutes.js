const Router = require("express").Router();
const address = require('../controllers/addressControllers');

Router.post('/:id', address.addAddress)
Router.get('/search', address.searchAndFilter)
Router.patch('/default', address.changeDefaultAddress)

module.exports = Router
