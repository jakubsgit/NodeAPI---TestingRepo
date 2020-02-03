const User = require("../models/user");
const Post = require("../models/post");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const deleteFile = require("../util/file").deleteFile;

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
      "somesupersecrettoken",
      { expiresIn: "1h" }
    );
    return { token: token, userId: user._id.toString() };
  },
  createPost: async function({ postInput }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    const errors = [];
    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: "Title is invalid." });
    }
    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.content, { min: 5 })
    ) {
      errors.push({ message: "Content is invalid." });
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input.");
      error.data = errors;
      error.code = 422;
      throw error;
    }
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("Invalid user.");
      error.code = 401;
      throw error;
    }
    const post = new Post({
      title: postInput.title,
      content: postInput.content,
      image: postInput.image,
      creator: user
    });
    const createdPost = await post.save();
    user.posts.push(createdPost);
    await user.save();
    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString()
    };
  },
  posts: async function(args, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    const totalPosts = await Post.find().countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("creator");
    return {
      posts: posts.map(p => {
        return {
          ...p._doc,
          _id: p._id.toString(),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString()
        };
      }),
      totalPosts: totalPosts
    };
  },
  posts: async function({ page }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    if (!page) {
      page = 1;
    }
    const perPage = 3;
    const totalPost = await Post.find().countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate("creator");
    return {
      posts: posts.map(p => {
        return {
          ...p._doc,
          _id: p._id.toString(),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString()
        };
      }),
      totalPosts: totalPost
    };
  },
  post: async function({ _id }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }

    const post = await Post.findOne({ _id: _id }).populate("creator");
    if (!post) {
      const error = new Error("no post found");
      error.code = 401;
      throw error;
    }
    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    };
  },
  updatePost: async function({ _id, postInput }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    const post = await Post.findOne({ _id: _id }).populate("creator");
    if (post.creator._id.toString() !== req.userId.toString()) {
      const error = new Error("Dont have permition to edit this post");
      error.code = 401;
      throw error;
    }
    post.title = postInput.title;
    post.content = postInput.content;
    if (postInput.image !== "undefined") {
      post.image = postInput.image;
    }
    const updatedPost = await post.save();
    return {
      ...updatedPost._doc,
      _id: updatedPost._id.toString(),
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString()
    };
  },
  deletePost: async function({ _id }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }

    const post = await Post.findOne({ _id: _id });
    if (!post) {
      const error = new Error("No post has been found");
      error.code = 401;
      throw error;
    }
    if (post.creator._id.toString() !== req.userId.toString()) {
      const error = new Error("Dont have permition to edit this post");
      error.code = 401;
      throw error;
    }
    //we need to remember to type correct file path not a _id
    deleteFile(post.image);
    await Post.deleteOne({ _id: post._id });
    const user = await User.findOne({ _id: req.userId.toString() });
    user.posts.pull(_id);
    await user.save();
    return true;
  }
};
