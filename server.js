require('./models/index')
require('dotenv').config()
const app = require('express')()
const bodyParser = require('body-parser')
const router = require('./routes/mainRoutes')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use("/", router)
app.listen(process.env.PORT, function(req,res){
    console.log(`Server is running on ${process.env.PORT}`);
})