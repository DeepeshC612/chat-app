const router = require('express').Router()
const userRotes = require('./userRoutes')

router.use("/user", userRotes)

module.exports = router
