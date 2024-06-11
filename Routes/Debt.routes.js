// debt / getDebtData;
const express = require("express");
const { authMiddleware, authMiddleware2 } = require("../middleware/Auth");
const controllerData = require("../Controllers/Debet.Controller");
const router = express.Router();
const Upload = require("../Utility/FiledataManager");

require("dotenv").config();
router.get("/debt/getDebtData", authMiddleware, controllerData.getDebtData);
router.put(
  "/debt/confirmDebtPayment",
  Upload.single("newAttachedFiles"),
  authMiddleware,
  controllerData.confirmDebtPayment
);
router.delete(
  "/debt/deleteDebtData",
  authMiddleware,
  controllerData.deleteDebtData
);

router.post(
  "/debt/deletePaidMoneyData",
  authMiddleware,
  authMiddleware2,
  controllerData.deletePaidMoneyData
);
module.exports = router;
