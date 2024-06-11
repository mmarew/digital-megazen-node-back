const express = require("express");
const { authMiddleware, authMiddleware2 } = require("../middleware/Auth");
const controllerData = require("../Controllers/Credit.controller");
const router = express.Router();
require("dotenv").config();
const upload = require("../Utility/FiledataManager");
router.get(
  "/Credit/getUsersCreditList",
  upload.single("collectedCreditFile"),
  authMiddleware,
  controllerData.getCreditList
);

router.post(
  "/updatePartiallyPaidInfo",
  authMiddleware,
  authMiddleware2,
  controllerData.updatePartiallyPaidInfo
);

router.put(
  "/confirmPayments",
  upload.single("collectedCreditFile"),
  authMiddleware,
  controllerData.confirmPayments
);

module.exports = router;
