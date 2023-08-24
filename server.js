const service = require('./service/index')
require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const router = require('./routes/mainRoutes')
const { database } = service
const helmet = require('helmet')
const cors = require('cors')
const socket = require('./socket/index')

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static('public'));
app.use("/uploads", express.static('uploads'))

app.use("/", router)
const server = app.listen(process.env.PORT, function(req,res){
    database()
    console.log(`Server is running on ${process.env.PORT}`);
})
socket(server)