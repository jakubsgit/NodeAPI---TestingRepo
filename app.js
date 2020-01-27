const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const mongoose = require("mongoose");

const feedRoutes = require("./routes/feed");

const app = express();

//app.use(bodyParser.urlencoded());

app.use(bodyParser.json()); //application.json
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);

//we can catch some errors in this function and read it's properties
//it's much more elegant way to read an errrors
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

mongoose
  .connect(
    "mongodb+srv://Jakub:postapi@postapi-r2vge.mongodb.net/messages?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  .then(() => {
    console.log("DBconnected!");
    app.listen(8080);
  })
  .catch(err => {
    console.log(err);
  });
