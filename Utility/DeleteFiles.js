const fs = require("fs");
const path = require("path");
// Delete the file
let deleteFiles = (filename) => {
  const filePath = path.resolve(__dirname, "../uploads", filename);
  console.log("__dirname");

  fs.unlink(filePath, (err) => {
    if (err) {
      // Handle the error if the file deletion fails
      console.error(err);
    } else {
      // File deletion succeeded
      console.log({ message: "File deleted successfully" });
    }
  });
};
module.exports = { deleteFiles };
