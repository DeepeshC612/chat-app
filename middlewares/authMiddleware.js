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
        error: "Invalid token!",
      });
    }
  } else {
    res.status(403).json({
      error: "Token is required for authentication",
    });
  }
};


const isUserLogin = async (req, res, next) => {
  const isUserExist = await user.findOne({ where: { email: req.body.email } });
  if (isUserExist) {
    if (isUserExist.userRole === "admin") {
      next();
    } else {
      if (isUserExist.userRole === "user") {
        next();
      } else {
        res.status(401).json({
          message: "You are not authorized",
        });
      }
    }
  } else {
    res.status(400).json({
      message: "Role is not present",
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
