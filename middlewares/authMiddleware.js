const jwt = require("jsonwebtoken");
require("dotenv").config();
const models = require("../models/index");
const { User } = models;

const authenticate = async (req, res, next) => {
  let token;
  const authentication = req.headers.authorization;
  if (authentication) {
    token = authentication.split(" ")[1];
    try {
      const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (userID){
        const user = await User.findOne({where: { id: userID.id }})
        if (user) {
          req.userID = user;
          next();
        } else {
          res.status(401).json({
            success: false,
            error: "User not found",
          });
        }
      } else {
        res.status(401).json({
          success: false,
          error: "Unauthorized user no token",
        });
      }
    } catch (err) {
      res.status(401).json({
        success: false,
        error: "Unauthorized user " + err.message,
      });
    }
  }
};

// const isUserLogin = async (req, res, next) => {
//   try {
//     const { userRole, email } = req.body;
//     const isEmailExist = await User.findOne({ where: { email: email } });
//     if (isEmailExist) {
//       if (isEmailExist.userRole === userRole) {
//         next();
//       } else {
//         if (userRole === "admin") {
//           res.status(401).json({
//             message: "You are not admin",
//           });
//         } else {
//           if (userRole === "user") {
//             res.status(401).json({
//               message: "You are not user",
//             });
//           } else {
//             res.status(404).json({
//               message: "Role is not valid",
//             });
//           }
//         }
//       }
//     } else {
//       res.status(404).json({
//         message: "User is not exists with this email",
//       });
//     }
//   } catch (err) {
//     res.status(400).json({
//       success: "failure",
//       message: "Error occur " + err.message,
//     });
//   }
// };

const resourceAccessMiddleware = (userTypeArr) => async (req, res, next) => {
  const {
    userID: { userRole },
  } = req;
  try{
    if(~userTypeArr.indexOf(userRole)){
      next();
    } else {
      res.status(401).json({
        message: `Resource can not be accessed by ${userRole ?? ''}`,
      });
    }
  }catch(err){
    res.status(401).json({
      message: "You are not authorized",
    });
    next(err)
  }
};

module.exports = {
  authenticate,
  // isUserLogin,
  resourceAccessMiddleware,
};
