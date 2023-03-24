require('./models/index')
require('dotenv').config()
const app = require('express')()
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.listen(process.env.PORT, function(req,res){
    console.log(`Server is running on ${process.env.PORT}`);
})