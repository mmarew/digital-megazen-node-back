const Router = require("express").Router();
const Upload = require("../Utility/FiledataManager");
// const upload = multer({ dest: "uploads/" });

const controller = require("../Controllers/Bankdeposit.Controller");
const { authMiddleware, authMiddleware2 } = require("../middleware/Auth");

Router.post(
  "/bankDeposit/registerDeposit",
  authMiddleware,
  Upload.single("selectedFile"),
  controller.registerDeposit
);
Router.get("/bankDeposit/getDeposit", authMiddleware, controller.getDeposit);
Router.put(
  "/bankDeposit/updateDeposit",
  authMiddleware,
  Upload.single("newAttachedFiles"),
  controller.updateDeposit
);
Router.delete(
  "/bankDeposit/deleteDeposit/",
  authMiddleware,
  authMiddleware2,
  controller.deleteDeposit
);
module.exports = Router;
