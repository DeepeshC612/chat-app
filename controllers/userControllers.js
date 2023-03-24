const userSchema = require("../models/userModel");
const bcrypt = require("bcrypt");

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

module.exports = {
  signUp,
};
