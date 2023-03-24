const jwt = require("jsonwebtoken");
const { secretKey } = require("../config/config");

const authenticate = (req, res, next) => {
  let token;
  const authentication = req.headers.authorization;
  if (authentication) {
    token = authentication.split(" ")[1];
    try {
        const decode = jwt.verify(token, secretKey);
        req.user = decode;
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
