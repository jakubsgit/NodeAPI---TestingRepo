require("dotenv").config();
const mongdb = require("mongodb");
let _db;

const MongoClient = mongdb.MongoClient;

const mongoConnect = callback => {
  MongoClient.connect(
    `mongodb+srv://jakubsnode:${process.env.password}@jakubsnode-ac2qp.mongodb.net/test?retryWrites=true&w=majority`,
    {
      useUnifiedTopology: true,
      useNewUrlParser: true
    }
  )
    .then(client => {
      console.log("Connnected");
      _db = client.db();
      callback();
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No data base found";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
