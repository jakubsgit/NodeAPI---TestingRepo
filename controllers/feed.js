const { validationResult } = require("express-validator");
const Post = require("../models/post");

exports.getPost = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: "1",
        title: "It's brand new post of my",
        content: "The content of the post",
        image: "../images/phone.png",
        creator: "Jakub Antczak",
        createdAt: new Date()
      }
    ]
  });
};

//In API the errors mesages are very important to get know what's happening behind the scenes
exports.createPost = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed, check the data of the post",
      errors: error.array()
    });
  }
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title: title,
    content: content,
    creator: { name: "Jakub" }
  });
  //create post in db
  res.status(201).json({
    message: "Post created succesfully"
  });
};
