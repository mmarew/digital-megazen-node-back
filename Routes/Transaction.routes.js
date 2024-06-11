const express = require("express");
const Upload = require("../Utility/FiledataManager");
let path = "/";
const {
  authMiddleware,
  authMiddleware2,
  authMiddlewareIsAdminOrEmployee,
  authMiddlewareIsAdmin,
} = require("../middleware/Auth");
const {
  registerSingleSalesTransaction,
  getDailyTransaction,
  deleteDailyTransactionController,
  updateDailyTransactionsController,
  getSingleItemsTransactionController,
  getMultipleItemsTransactionController,
  getBusinessTransactionsController,
  deleteSales_purchaseController,
  registerTransactionController,
  ViewTransactionsController,
  updateTransactionsController,
} = require("../Controllers/Transaction.Controller");
const router = express.Router();

router.put(
  "/Transaction/updateDailyTransactions",
  Upload.single("newlyAttachedFile"),
  authMiddleware,
  authMiddlewareIsAdmin,
  updateDailyTransactionsController
);

// Transaction;

router.post(
  "/Transaction/registerSinglesalesTransaction/",
  Upload.single("selectedFile"),
  authMiddleware,
  authMiddlewareIsAdminOrEmployee,
  registerSingleSalesTransaction
);
router.post(
  "/Transaction/getDailyTransaction",
  authMiddleware,
  authMiddlewareIsAdminOrEmployee,
  getDailyTransaction
);
router.post(
  "/Transaction/deleteDailyTransaction",
  authMiddleware,
  authMiddleware2,
  authMiddlewareIsAdmin,
  deleteDailyTransactionController
);
router.get(
  "/getSingleItemsTransaction",
  authMiddleware,
  authMiddlewareIsAdminOrEmployee,
  getSingleItemsTransactionController
);

router.get(
  "/getMultipleItemsTransaction",
  authMiddleware,
  authMiddlewareIsAdminOrEmployee,
  getMultipleItemsTransactionController
);
router.get(
  "/getBusinessTransactions",
  authMiddleware,
  authMiddlewareIsAdminOrEmployee,
  getBusinessTransactionsController
);
router.post(
  path + "deleteSales_purchase/",
  authMiddleware,
  authMiddlewareIsAdmin,
  authMiddleware2,
  deleteSales_purchaseController
);
router.post(
  path + "registerTransaction/",
  authMiddleware,
  authMiddlewareIsAdminOrEmployee,
  registerTransactionController
);

router.post(
  path + "ViewTransactions/",
  authMiddleware,
  authMiddlewareIsAdminOrEmployee,
  ViewTransactionsController
);
router.post(
  path + "updateTransactions/",
  authMiddleware,
  authMiddlewareIsAdmin,
  updateTransactionsController
);
module.exports = router;
