const jwt = require("jsonwebtoken");

//if we want ot create great middleware with token creating we need to set headers in our fetch fnction to Authorization: "Bearer token"

module.exports = (req, res, next) => {
  const headers = req.get("Authorization");
  if (!headers) {
    req.isAuth = false;
    return next();
  }
  const token = headers.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "somesupersecrettoken");
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  req.userId = decodedToken.userId;
  req.isAuth = true;
  next();
};
