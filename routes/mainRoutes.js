const router = require('express').Router()
const userRotes = require('./userRoutes')
const addressRotes = require('./addressRoutes')
const adminRoutes = require('./adminRoutes')

router.use("/user", userRotes)
router.use("/address", addressRotes)
router.use("/admin", adminRoutes)

module.exports = router
