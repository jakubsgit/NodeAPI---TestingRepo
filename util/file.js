const fs = require("fs");

const deleteFile = filePath => {
  fs.unlink(filePath, (err, data) => {
    if (err) {
      return new Error("The file does not exist");
    }
  });
};

exports.deleteFile = deleteFile;
