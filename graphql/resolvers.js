const User = require("../models/user");
const bcrypt = require("bcryptjs");
const validator = require("validator");

module.exports = {
  createUser: async function({ userInput }, req) {
    const existingUser = await User.findOne({ email: userInput.email });
    const errors = [];
    if (existingUser) {
      error.push(new Error("user alredy exist"));
    }
    if (!validator.isEmail(userInput.email)) {
      error.push(new Error("this email supposed to be an email"));
    }
    if (
      validator.isEmpty(userInput.password) ||
      validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push(new Error("this password is too short"));
    }
        if (errors.)
    const hashedPass = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPass
    });
    const createdUser = await user.save();
    return {
      ...createdUser._doc,
      _id: createdUser._id.toString()
    };
  }
};
