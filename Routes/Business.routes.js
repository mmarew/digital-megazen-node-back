const Router = require("express").Router();
const { authMiddleware, authMiddleware2 } = require("../middleware/Auth");
let {
  createBusiness,
  getBusiness,
  deleteBusiness,
  updateBusinessName,
  removeEmployeersBusinessController,
} = require("../Controllers/Business.controllers");
Router.post("/business/createbusiness", authMiddleware, createBusiness);
Router.post("/business/getBusiness", authMiddleware, getBusiness);
Router.post(
  "/business/deleteBusines",
  authMiddleware,
  authMiddleware2,
  deleteBusiness
);
Router.post("/business/updateBusinessName", authMiddleware, updateBusinessName);
Router.post(
  "/removeEmployeersBusiness/",
  authMiddleware,
  authMiddleware2,
  removeEmployeersBusinessController
);

module.exports = Router;
