const express = require("express");
const { body } = require("express-validator");

const feedController = require("../controllers/feed");

const router = express.Router();

//GET feed/posts
router.get("/posts?:page", feedController.getPosts);

router.post(
  "/post",
  [
    body("title")
      .trim()
      .isLength({ min: 5 }),
    body("content")
      .trim()
      .isLength({ min: 5 })
  ],
  feedController.createPost
);

router.get("/post/:postId", feedController.getPost);

router.post("/delete-post/:postId", feedController.deleteById);

router.put(
  "/edit/:postId",
  [
    body("title")
      .trim()
      .isLength({ min: 5 }),
    body("content")
      .trim()
      .isLength({ min: 5 })
  ],
  feedController.postEditPost
);

module.exports = router;
