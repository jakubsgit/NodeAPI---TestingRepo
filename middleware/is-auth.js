const jwt = require("jsonwebtoken");

//if we want ot create great middleware with token creating we need to set headers in our fetch fnction to Authorization: "Bearer token"

module.exports = (req, res, next) => {
  const headers = req.get("Authorization");
  if (!headers) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  const token = req.get("Authorization").split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "somesupersecrettoken");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};
