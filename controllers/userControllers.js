const userSchema = require("../models/userModel");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const signUp = async (req, res) => {
  try {
    const regData = await new userSchema(req.body);
    const isUserExist = await userSchema.findOne({
      where: { email: req.body.email },
    });
    if (isUserExist) {
      res.status(409).json({
        success: false,
        message: "User is already exist with this email",
      });
    } else {
      const salt = await bcrypt.genSalt(10);
      regData.password = await bcrypt.hash(req.body.password, salt);
      const filePath = req.file.path;
      regData.profilePic = `${filePath}`;
      const userData = await regData.save();
      res.status(201).json({
        success: true,
        message: "User created successfully",
        user: userData,
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error occur " + err.message,
    });
  }
};

const logIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const isUserExist = await userSchema.findOne({ where: { email: email } });
    if (isUserExist) {
      const pass = await bcrypt.compare(password, isUserExist.password);
      if (pass) {
        let token = await jwt.sign(
          { userID: isUserExist.id },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "2h",
          }
        );
        res.status(200).json({
          success: true,
          message: "Login successfully",
          email: isUserExist.email,
          firstName: isUserExist.firstName,
          lastName: isUserExist.lastName,
          token: token,
        });
      } else {
        res.status(402).json({
          success: false,
          message: "Email or password is wrong",
        });
      }
    } else {
      res.status(403).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "Error occur " + err.message,
    });
  }
};

module.exports = {
  signUp,
  logIn,
};
