const User = require("../models/user");
const Post = require("../models/post");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

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
    //what the fuck with the isLength finction in validator??
    if (
      validator.isEmpty(userInput.password)
      //   validator.isLength(userInput.password, { min: 1, max: undefined })
    ) {
      errors.push(new Error("this password is too short"));
    }
    if (errors.length > 0) {
      console.log(errors);
      const error = new Error("Invalid input");
      error.data = errors;
      error.code = 422;
      throw error;
    }
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
  },
  login: async function({ email, password }) {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("user not found");
      error.code = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong password typed");
      error.code = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email
      },
      "supersecretsecret",
      { expiresIn: "1h" }
    );
    return { token: token, userId: user._id.toString() };
  },
  createPost: async function({ postInput }, req) {
    const errors = [];
    if (
      validator.isEmpty(postInput.title) ||
      validator.isLength(postInput.title[{ min: 5 }])
    ) {
      errors.push("Your title is missed or it is to short");
    }
    if (
      validator.isEmpty(postInput.content) ||
      validator.isLength(postInput.content, [{ min: 5 }])
    ) {
      errors.push("Your content is missed or it is to short");
    }
    if (validator.isEmpty(postInput.image)) {
      errors.push("Your image is missed or it is wrong format");
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input");
      error.data = errors;
      error.code = 422;
      throw error;
    }
    const post = new Post({
      title: postInput.title,
      content: postInput.content,
      image: postInput.image
    });
    const createdPost = await post.save();
    // We need to add some creator to our post
    return {
      ...createdPost,
      _id: createdPost._id.toString()
    };
  }
};
