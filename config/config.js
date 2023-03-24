require('dotenv').config()

const configData={
    host: process.env.HOST,
    dialect: process.env.DIALECT,
    username:process.env.USER,
    password:process.env.PASS,
    DatabaseName:process.env.DATABASE
}

module.exports={configData}