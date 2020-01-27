const { validationResult } = require("express-validator");
const Post = require("../models/post");

const deleteFile = require("../util/file").deleteFile;

exports.getPosts = (req, res, next) => {
  Post.find()
    .then(posts => {
      if (!posts) {
        const error = new Error("No posts to show");
        error.statusCode(422);
        throw error;
      }
      res.status(200).json({
        message: "Posts fatched successfully",
        posts: posts
      });
    })
    .catch(err => {
      if (err.statusCode) {
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
  let imageUrl;
  if (!errors.isEmpty()) {
    const error = new Error("Vaidation failed, entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  if (!req.file) {
    const error = new Error(
      "The file does not exist in the current environment"
    );
    error.statusCode = 422;
    throw error;
  } else {
    console.log(req.file.path);
    imageUrl = req.file.path;
  }

  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: { name: "Jakub" }
  });
  post
    .save()
    .then(result => {
      console.log(result);
      res.status(200).json({
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

exports.deleteById = (req, res, next) => {
  const postId = req.params.postId;
  Post.findOne({ _id: postId })
    .then(post => {
      if (!post) {
        const error = new Error("Post with this id was not found");
        error.statusCode = 422;
        throw error;
      }
      Post.deleteOne(post)
        .then(result => {
          deleteFile(post.imageUrl);
          console.log(result);
          res.status(200).json({ message: "Post successfully deleted" });
        })
        .catch(err => {
          console.log(err);
        });
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
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
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
      console.log(post);
      if (imageUrl !== post.imageUrl) {
        deleteFile(post.imageUrl);
      }
      post.title = updatedTitle;
      post.content = updatedContent;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then(result =>
      res.status(200).json({ message: "Post updated", post: result })
    )
    .catch(err => {
      console.log(err);
      const error = err;
      error.statusCode = 500;
      return next(error);
    });
};
