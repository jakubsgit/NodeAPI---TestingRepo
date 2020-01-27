const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const User = require("../models/user");

const authControllers = require("../controllers/auth");

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject("E-Mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 5 }),
    body("name")
      .trim()
      .not()
      .isEmpty()
  ],
  authControllers.postSignUp
);

router.post(
  "/signin",
  [
    body("email")
      .isEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(UserDoc => {
          if (UserDoc) {
            return Promise.reject("Wrong email or password");
          }
        });
      })
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 5 }),
    body("name")
      .trim()
      .not()
      .isEmpty()
  ],
  authControllers.postSignIn
);

module.exports = router;
