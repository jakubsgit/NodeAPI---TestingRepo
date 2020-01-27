const { validationResult } = require("express-validator");
const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        title: "It's brand new post of my",
        content: "The content of the post",
        image: "../images/phone.png",
        creator: "Jakub Antczak",
        createdAt: new Date()
      }
    ]
  });
};
exports.getPost = (req, res, next) => {
  const postId = req.body.postId;
};

//In API the errors mesages are very important to get know what's happening behind the scenes
exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Vaidation failed, entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title: title,
    content: content,
    imageUrl: "images.jpg",
    creator: { name: "Jakub" }
  });
  post
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Post created successfully!",
        post: result
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
