const models = require("../models/index");
const { User } = models;
const bcrypt = require("bcrypt");
require("dotenv").config();
const mail = require("../service/emailService");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const signUp = async (req, res) => {
  try {
    const regData = await new User(req.body);
    const isUserExist = await User.findOne({
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
      const imagePath = "/uploads/" + req.file.filename;
      regData.profilePic = imagePath
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
    const isUserExist = await User.findOne({ where: { email: email } });
    if (isUserExist) {
      const pass = await bcrypt.compare(password, isUserExist.password);
      if (pass) {
        let token = await jwt.sign(
          { userID: isUserExist },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "2h",
          }
        );
        res.status(200).json({
          success: true,
          message: "Login successfully",
          id: isUserExist.id,
          name: isUserExist.firstName + " " + isUserExist.lastName,
          roomId: isUserExist.firstName + isUserExist.email,
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
const userList = async (req, res) => {
  try {
    const { id } = req.body;
    const isUserExist = await User.findAll({ where: { id: { [Op.ne]: id } } });
    if (isUserExist) {
        res.status(200).json({
          success: true,
          message: "user list fetched",
          user: isUserExist,
        }); 
    } else {
      res.status(403).json({
        success: false,
        message: "Users not found",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "Error occur " + err.message,
    });
  }
};

const emailForResetPass = async (req, res) => {
  const email = req.body.email;
  try {
    const isUserExist = await User.findOne({ where: { email: email } });
    if (isUserExist) {
      const secretKey = isUserExist.id + process.env.JWT_SECRET_KEY;
      const token = jwt.sign({ userID: isUserExist.id }, secretKey, {
        expiresIn: "1h",
      });
      // mail.sendMail(email, isUserExist.id, token)
      res.status(200).json({
        success: true,
        message: "Email send successfully please check your inbox",
        token: token,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "This email is not registered",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "Error occur " + err.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  const id = req.params.id;
  try {
    const userExists = await User.findByPk(id);
    const authorization = req.headers.authorization;
    const token = authorization.split(" ")[1];
    const secretKey = userExists.id + process.env.JWT_SECRET_KEY;
    jwt.verify(token, secretKey);
    if (newPassword && confirmPassword) {
      if (newPassword !== confirmPassword) {
        res.status(401).json({
          success: "failure",
          error: "New password & confirm password doesn't match",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(confirmPassword, salt);
        await User.update(
          { password: newHashPassword },
          { where: { id: userExists.id } }
        );
        res.status(201).json({
          success: true,
          message: "Password reset successfully",
        });
      }
    } else {
      res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error occur " + err.message,
    });
  }
};

const changePassword = async (req, res) => {
  const id = req.userID;
  const { oldPassword, newPassword, confirmPassword } = req.body;
  try {
    const alreadyExists = await User.findByPk(id);
    if (alreadyExists) {
      const passwordCheck = await bcrypt.compare(
        oldPassword,
        alreadyExists.password
      );
      if (passwordCheck) {
        if (newPassword && confirmPassword) {
          const setNewHashPassword = await bcrypt.hash(newPassword, 10);
          const updatePassword = await User.update(
            {
              password: setNewHashPassword,
            },
            { where: { id: alreadyExists.id } }
          );
          res.status(202).json({
            success: true,
            message: "Password changed successfully",
            data: updatePassword,
          });
        } else {
          res.status(400).json({
            success: false,
            error: "New password and confirm password can not be empty",
          });
        }
      } else {
        res.status(401).json({
          success: false,
          error: "Old password is wrong",
        });
      }
    } else {
      res.status(402).json({
        success: false,
        error: "User not exists with this email",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error occur " + err.message,
    });
  }
};

module.exports = {
  signUp,
  logIn,
  emailForResetPass,
  forgotPassword,
  changePassword
};
