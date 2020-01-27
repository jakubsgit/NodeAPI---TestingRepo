const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const User = require("../models/user");

const authControllers = require("../controllers/auth");

router.get(
  "/signup",
  [
    body("emial")
      .isEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(UserDoc => {
          if (UserDoc) {
            return Promise.reject("This email already is ocupated");
          }
        });
      })
      .normalizeEmail(),
    body("password").length({ min: 5 })
  ],
  authControllers.getSignup
);

module.exports = router;
