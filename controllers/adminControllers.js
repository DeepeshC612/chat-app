const Admin = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')


const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const isAdminExists = await Admin.findOne({ where: { email: email } });
    if (isAdminExists) {
      const pass = await bcrypt.compare(password, isAdminExists.password);
      if (pass) {
        let token = await jwt.sign(
          { adminID: isAdminExists.id },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "2h",
          }
        );
        res.status(200).json({
          success: true,
          message: "Login successfully",
          email: isAdminExists.email,
          firstName: isAdminExists.firstName,
          lastName: isAdminExists.lastName,
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
        message: "User not registered with this email",
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
  adminLogin
};
