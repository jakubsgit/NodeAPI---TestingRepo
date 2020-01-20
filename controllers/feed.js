exports.getPost = (req, res, next) => {
  res.status(200).json({
    posts: [
      { title: "first post of Jakub", content: "this is an amazing post!" }
    ]
  });
};

//In API the errors mesages are very important to get know what's happening behind the scenes
exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  //create post in db
  res.status(201).json({
    message: "Post created succesfully",
    post: { id: new Date().toISOString(), title: title, content: content }
  });
};
