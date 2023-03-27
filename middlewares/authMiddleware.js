const jwt = require("jsonwebtoken");
require('dotenv').config()

const authenticate = (req, res, next) => {
  let token;
  const authentication = req.headers.authorization;
  if (authentication) {
    token = authentication.split(" ")[1];
    try {
        const {userID} = jwt.verify(token, process.env.JWT_SECRET_KEY);
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

module.exports = {authenticate}
