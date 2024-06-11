const express = require("express");
const Router = express.Router();
const loginController = require("../Controllers/login.controllers");
const { authMiddleware } = require("../middleware/Auth");
Router.post("/Login/", loginController.login);
Router.post(
  "/Login/verifyLogin/",
  authMiddleware,
  loginController.verifyLoginController
);

Router.get("/requestPasswordReset/", loginController.requestPasswordReset);
Router.post("/verifyPin", loginController.verifyPin);
Router.post("/forgetRequest", loginController.forgetRequest);
Router.post("/updateChangeInpassword/", loginController.updateChangeInpassword);

module.exports = Router;
