const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const mongoose = require("mongoose");
const app = express();
const expressPlayground = require("graphql-playground-middleware-express")
  .default;

const deleteFile = require("./util/file").deleteFile;

//we need to require some ackage that is connected with graphql
const graphqlHttp = require("express-graphql");
//and also we need to remremeber about schamas that we already created
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");

const auth = require("./middleware/is-auth");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/pdf" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  }
  cb(null, false);
};
//app.use(bodyParser.urlencoded());

app.use(bodyParser.json()); //application.json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images")));

const policy = "default-src 'self'";

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(auth);

app.put("/post-image", (req, res, next) => {
  if (!req.isAuth) {
    throw new Error("Not authenticated!");
  }
  if (!req.file) {
    return res.status(200).json({ message: "No file provided!" });
  }
  if (req.body.oldPath) {
    deleteFile(req.body.oldPath);
  }
  return res
    .status(201)
    .json({ message: "File stored.", filePath: req.file.path });
});

app.use(
  "/graphql",
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message;
      const code = err.originalError.code || 500;
      return { message: message, status: code, data: data };
    }
  })
);
app.get("/playground", expressPlayground({ endpoint: "/graphql" }));
//we can catch some errors in this function and read it's properties
//it's much more elegant way to read an errrors
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    "mongodb+srv://Jakub:postapi@postapi-r2vge.mongodb.net/messages?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    }
  )
  .then(() => {
    console.log("db connected");
    app.listen(8080);
  })
  .catch(err => {
    console.log(err);
  });
