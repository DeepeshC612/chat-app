const Router = require("express").Router();
const upload = require("../middlewares/multiStoreMiddleware")
const chat = require("../controllers/chatControllers");
const {
  authenticate,
} = require("../middlewares/authMiddleware");
const path = require('path')

Router.get(
  "/",
  (req, res) =>{
    res.sendFile(path.resolve('./socket/login.html'))
  }
);
Router.get(
  "/signup",
  (req, res) =>{
    res.sendFile(path.resolve('./socket/signup.html'))
  }
);
Router.get(
  "/logged",
  (req, res) =>{
    res.sendFile(path.resolve('./socket/index.html'))
  }
);
Router.post(
  "/upload-image",
  upload.single('image'),
  chat.uploadImage
);


module.exports = Router;
