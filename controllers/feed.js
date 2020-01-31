const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
const io = require("../socket");

const deleteFile = require("../util/file").deleteFile;

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 3;
  let totalItems;
  Post.find()
    .countDocuments()
    .then(count => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .sort({ createdAt: -1 })
        .limit(perPage);
    })
    .then(posts => {
      res.status(200).json({
        message: "Fetched posts successfully.",
        posts: posts,
        totalItems: totalItems
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("I could not find your post on this id");
        error.statusCode = 404;
        throw error;
      }
      console.log(post),
        res.status(200).json({
          post: post
        });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//In API the errors mesages are very important to get know what's happening behind the scenes
exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }
  const image = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  let creator;
  const post = new Post({
    title: title,
    content: content,
    image: image,
    creator: req.userId
  });
  post
    .save()
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      creator = user;
      user.posts.push(post);
      io.getIO().emit("posts", { action: "create", post: post });
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        message: "Post created successfully!",
        post: post,
        creator: { _id: creator._id, name: creator.name }
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteById = (req, res, next) => {
  const postId = req.params.postId;
  let post;
  Post.findOne({ _id: postId })
    .then(post => {
      if (!post) {
        const error = new Error("Post with this id was not found");
        error.statusCode = 422;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error("Wrong user to delete this post");
        error.statusCode = 401;
        throw error;
      }
      io.getIO().emit("posts", { action: "delete", post: post });
      deleteFile(post.image);
      post = post;
      return Post.findByIdAndRemove({ _id: postId });
    })
    .then(result => {
      return User.findOne({ _id: req.userId });
    })
    .then(user => {
      user.posts.pull(postId);
      return user.save();
    })
    .then(result => {
      res.status(200).json({ message: "Post successfully deleted" });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      console.log(err);
      next(err);
    });
};

exports.postEditPost = (req, res, next) => {
  const postId = req.params.postId;
  const updatedTitle = req.body.title;
  const updatedContent = req.body.content;
  let image = req.body.image;
  if (req.file) {
    image = req.file.path;
  }
  if (!image) {
    const error = new Error("No image was picked!");
    error.statusCode = 422;
    throw error;
  }
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("The post of this is does not exist");
        error.statusCode = 422;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error("Wrong user to edit this post");
        error.statusCode = 401;
        throw error;
      }
      if (image !== post.image) {
        deleteFile(post.image);
      }
      post.title = updatedTitle;
      post.content = updatedContent;
      post.image = image;

      return post.save();
    })
    .then(result => {
      io.getIO().emit("posts", { action: "edit", post: result });
      res.status(200).json({ message: "Post updated", post: result });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      return next(err);
    });
};
