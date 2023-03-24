const router = require('express').Router()
const userRotes = require('./userRoutes')
const addressRotes = require('./addressRoutes')

router.use("/user", userRotes)
router.use("/address", addressRotes)

module.exports = router
