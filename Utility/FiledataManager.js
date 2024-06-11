const multer = require("multer");
const path = require("path");

// Define the file filter function
const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "video/mp4",
    "video/x-msvideo",
    "audio/mpeg",
    "audio/wav",
  ];

  // Check if the file's MIME type is allowed
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, images, Word documents, videos, and audio files are allowed."
      ),
      false
    ); // Reject the file
  }
};

// Configure Multer
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const extension = path.parse(file.originalname).ext;
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + extension);
  },
});
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = upload;
