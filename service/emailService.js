const nodemailer = require("nodemailer");
require("dotenv").config();

const sender = process.env.EMAIL;
const password = process.env.PASS;

const sendMail = (email, token) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: sender,
      pass: password,
    },
  });

  var mailOptions = {
    from: sender,
    to: email,
    subject: "Password reset",
    html: `
        <p>You requested for password reset</p>
        <h5> click in this <a href="http://localhost:3000/reset/${token}" >Link </a> to reset password 
        </h5>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.status(424).json({
        success: false,
        error: "Error occur " + error.message,
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Email send successfully " + info.response,
      });
    }
  });
};

module.exports = {
  sendMail,
};