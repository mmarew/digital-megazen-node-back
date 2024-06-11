const express = require("express");
const {
  authMiddleware,
  authMiddleware2,
  authMiddlewareIsAdmin,
  authMiddlewareIsAdminOrEmployee,
} = require("../middleware/Auth");
const {
  searchExpByName,
  getExpencesLists,
  deleteExpenceItem,
  getExpTransactions,
  AddExpencesItems,
  registerExpenseTransaction,
  updateMyExpensesList,
  updateExpencesItem,
  deleteExpenceTransaction,
} = require("../Controllers/Expences.controller");
const Upload = require("../Utility/FiledataManager");
const router = express.Router();
router.post("/", () => {});
router.get("/", () => {});
router.post(
  "/Expences/deleteExpenceTransaction/",
  authMiddleware,
  authMiddlewareIsAdmin,
  authMiddleware2,
  deleteExpenceTransaction
);

router.post(
  "/Expences/AddExpencesItems/",
  authMiddleware,
  authMiddlewareIsAdmin,
  AddExpencesItems
);
router.post(
  "/Expences/updateMyexpencesList",
  Upload.single("newlyAttachedFile"),
  authMiddleware,
  authMiddlewareIsAdmin,
  updateMyExpensesList
);
router.post(
  "/Expences/deleteExpencesItem",
  authMiddleware,
  authMiddlewareIsAdmin,
  authMiddleware2,
  deleteExpenceItem
);
router.post(
  `/Expences/registerExpenceTransaction/`,
  Upload.single("attachedFiles"),
  authMiddleware,
  authMiddlewareIsAdminOrEmployee,
  registerExpenseTransaction
);
router.get("/Expences/getExpTransactions", authMiddleware, getExpTransactions);
router.post(
  "/deleteExpenceItem",
  authMiddleware,
  authMiddlewareIsAdminOrEmployee,
  authMiddleware2,
  deleteExpenceItem
);
router.get(
  "/getExpencesLists/",
  authMiddleware,
  authMiddlewareIsAdminOrEmployee,
  getExpencesLists
);

router.post(
  "/searchExpByName",
  authMiddleware,
  authMiddlewareIsAdminOrEmployee,
  searchExpByName
);
router.post(
  "/updateExpencesItem/",
  authMiddleware,
  authMiddlewareIsAdmin,
  updateExpencesItem
);

module.exports = router;
