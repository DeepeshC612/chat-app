const router = require('express').Router()
const userRotes = require('./userRoutes')
const addressRotes = require('./addressRoutes')
const adminRoutes = require('./adminRoutes')   
const articleRoutes = require('./articleRoutes')                
const chatRoutes = require('./chatRoutes')

router.use("/user", userRotes)
router.use("/address", addressRotes)
router.use("/admin", adminRoutes)
router.use("/article", articleRoutes)
router.use("/chat", chatRoutes)

module.exports = router
