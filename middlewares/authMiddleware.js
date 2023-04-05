const jwt = require("jsonwebtoken");
require("dotenv").config();
const user = require("../models/userModel");

const authenticate = (req, res, next) => {
  let token;
  const authentication = req.headers.authorization;
  if (authentication) {
    token = authentication.split(" ")[1];
    try {
      const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.userID = userID;
      next();
    } catch (err) {
      res.status(401).json({
        success: false,
        error: "Unauthorized user " + err.message
      });
    }
  }
   if(!token) {
    res.status(401).json({
      success: false,
      error: "Unauthorized user no token",
    });
  }
};


const isUserLogin = async (req, res, next) => {
  try {
    const { userRole, email } = req.body
    const isEmailExist = await user.findOne({ where: { email: email } })
    if (isEmailExist) {
      if (isEmailExist.userRole === userRole) {
        next()
      } else {
        if (userRole === "admin") {
          res.status(401).json({
            message: "You are not admin",
          });
        } else {
          if(userRole==="user"){
          res.status(401).json({
            message: "You are not user",
          });
        }else{
          res.status(404).json({
            message: "Role is not valid",
          });
        }
      }
      }
    } else {
      res.status(404).json({
        message: "User is not exists with this email",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: "failure",
      message: "Error occur " + err.message,
    });
  }
};

const isAdmin = async (req, res, next) => {
  const isAdminExists = await user.findOne({ where: { id: req.userID } });
  if (isAdminExists) {
    if (isAdminExists.userRole === "admin") {
      next();
    } else {
      res.status(401).json({
        message: "You are not authorized",
      });
    }
  } else {
    res.status(400).json({
      message: "Role is not present",
    });
  }
};

module.exports = {
  authenticate,
  isUserLogin,
  isAdmin,
};
