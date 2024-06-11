const express = require("express");
const router = express.Router();
router.get("/", (req, res) => {
  res.json({ Message: "Nice and nice" });
});
let path = "/";
const {
  authMiddleware,
  authMiddleware2,
  authMiddlewareIsAdmin,
  authMiddlewareIsAdminOrEmployee,
  authMiddlewareIsEmployee,
} = require("../middleware/Auth.js");
const {
  deleteProductsController,
  searchProductsController,
  addProductsController,
  updateProductsController,
  getRegistrableProducts,
  getRegisteredProductsController,
} = require("../Controllers/Products.Controller.js");

router.post("/products/addProducts", authMiddleware, addProductsController);
router.post(
  "/products/deleteProducts/",
  authMiddleware,
  authMiddlewareIsAdmin,
  authMiddleware2,
  deleteProductsController
);
router.get(
  "/products/searchProducts/",
  authMiddleware,
  authMiddlewareIsAdminOrEmployee,
  searchProductsController
);
router.post(
  "/products/updateProducts",
  authMiddleware,
  authMiddlewareIsAdmin,
  updateProductsController
);
router.post(
  "/products/getRegistrableProducts",
  authMiddleware,
  authMiddlewareIsAdminOrEmployee,
  getRegistrableProducts
);
router.post(
  "/products/getRegisteredProducts/",
  authMiddleware,
  authMiddlewareIsAdminOrEmployee,
  getRegisteredProductsController
);
router.post(
  path + "registerEmployeersProducts/",
  authMiddlewareIsEmployee,
  authMiddleware,
  (req, res) => {
    let TranactionProducts = req.body.tranactionProducts,
      EmployeersProduct = req.body.EmployeersProduct;
    let ProductId = EmployeersProduct[0].ProductId;
    //  { purchase_1: '456', sales_1: '400', Wrickage_1: '6' }
    let purchase_ = "purchase_" + ProductId,
      sales_ = "sales_" + ProductId,
      Wrickage_ = "Wrickage_" + ProductId;
    let purchaseQty = TranactionProducts[purchase_],
      salesQty = TranactionProducts[sales_],
      wrickageQty = TranactionProducts[Wrickage_];
    res.json({ data: req.body });
  }
);
module.exports = router;
