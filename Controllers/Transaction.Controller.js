const { deleteTransactions } = require("../Services/Transaction.service");

const registerInservice =
  require("../Services/Transaction.service").registerSinglesalesTransaction;

let registerSingleSalesTransaction = async (req, res) => {
  let attachedFilesName = req?.file?.filename;
  req.body.attachedFilesName = attachedFilesName;
  let responces = await registerInservice(req.body);
  let { Message } = responces;
  if (Message == "Error") {
    return res.status(400).json(responces);
  }
  res.json(responces);
};
let getDailyTransaction = async (req, res) => {
  let responces =
    await require("../Services/Transaction.service").getDailyTransaction(
      req.body
    );
  let { data } = responces;
  if (data == "error") return res.status(500).json(responces);
  return res.status(200).json(responces);
};
let deleteDailyTransactionController = async (req, res) => {
  let Result = await deleteTransactions(req.body);
  res.json(Result);
};
let updateDailyTransactionsController = async (req, res) => {
  let newlyAttachedFilesName = req?.file?.filename;
  req.body.newlyAttachedFilesName = newlyAttachedFilesName;
  let Result =
    await require("../Services/Transaction.service").updateDailyTransactions(
      req.body
    );
  let { data } = Result;
  if (data == "update successfully") {
    res.status(200).json(Result);
  } else {
    res.status(500).json(Result);
  }
};
let getSingleItemsTransactionController = async (req, res) => {
  let Result =
    await require("../Services/Transaction.service").getSingleItemsTransaction(
      req.body,
      req.query
    );
  res.json(Result);
};
let getMultipleItemsTransactionController = async (req, res) => {
  let Result =
    await require("../Services/Transaction.service").getMultipleItemsTransaction(
      req.body,
      req.query
    );
  res.json(Result);
};
let getBusinessTransactionsController = async (req, res) => {
  let Result =
    await require("../Services/Transaction.service").getBusinessTransactions(
      req.body,
      req.query
    );
  res.json(Result);
};
let deleteSales_purchaseController = async (req, res) => {
  let Result =
    await require("../Services/Transaction.service").deleteSalesPurchase(
      req.body
    );
  res.json(Result);
};
let registerTransactionController = async (req, res) => {
  let Result =
    await require("../Services/Transaction.service").registerTransaction(
      req.body
    );
  res.json(Result);
};
let ViewTransactionsController = async (req, res) => {
  let Result =
    await require("../Services/Transaction.service").ViewTransactions(req.body);
  res.json(Result);
};
let updateTransactionsController = (req, res) => {
  let Result = require("../Services/Transaction.service").updateTransactions(
    req.body
  );
  res.json(Result);
};
module.exports = {
  updateTransactionsController,
  ViewTransactionsController,
  registerTransactionController,
  deleteSales_purchaseController,
  getBusinessTransactionsController,
  getMultipleItemsTransactionController,
  getSingleItemsTransactionController,
  updateDailyTransactionsController,
  getDailyTransaction,
  deleteDailyTransactionController,
  registerSingleSalesTransaction,
};
