const {
  addProducts,
  getRegisteredProducts,
  registrableProductsServices,
  updateProducts,
  deleteProducts,
  searchProducts,
} = require("../Services/Product.Service");

let addProductsController = async (req, res) => {
  let result = await addProducts(req.body);
  let { Message } = result;
  if (Message == "Error") return res.status(400).json(result);
  else res.json(result);
};
const searchProductsController = async (req, res) => {
    let result = await searchProducts(req.body, req.query);
    res.json(result);
  },
  deleteProductsController = async (req, res) => {
    let result = await deleteProducts(req.body);
    res.json(result);
  },
  updateProductsController = async (req, res) => {
    let result = await updateProducts(req.body);
    res.json(result);
  },
  getRegistrableProducts = async (req, res) => {
    let result = await registrableProductsServices(req.body);
    res.json(result);
  },
  getRegisteredProductsController = async (req, res) => {
    let result = await getRegisteredProducts(req.body);
    res.json(result);
  };
// module.exports = {
//   addProduct,
//   searchProducts,
//   deleteProducts,
//   updateProducts,
//   getRegisteredProducts,
// };
module.exports = {
  searchProductsController,
  deleteProductsController,
  updateProductsController,
  getRegistrableProducts,
  getRegisteredProductsController,
  addProductsController,
};
