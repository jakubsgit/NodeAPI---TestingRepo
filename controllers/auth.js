const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

exports.postSignUp = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  bcrypt
    .hash(password, 12)
    //here we have our crypted password and we can connect it to the certain user
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        name: name,
        posts: []
      });
      return user.save();
    })
    .then(result => {
      res.status(201).json({ message: "great it works", userId: result._id });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.postSignIn = (req, res, next) => {
  const errors = validationResult(req);
  if (errors) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ emial: email })
    .then(user => {
      if (!user) {
        const error = new Error("Invalid email name or password");
        error.statusCode = 422;
        throw error;
      }
      bcrypt(password, user.password).then(doMatch => {
        if (doMatch) {
          req.isloggedIn = true;
        }
        const error = new Error("Incorrect password");
        error.statusCode = 422;
        throw error;
      });
    })
    .catch(err => {
      next(err);
    });
};
