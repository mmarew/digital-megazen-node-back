let serviceData = require("../Services/Expences.service");
let deleteExpenceTransaction = async (req, res) => {
  let result = await serviceData.deleteExpenceTransaction(req.body);
  res.json(result);
};
// router.post("/updateCostData/", authMiddleware, async (req, res) => {})
let controllerUpdateExpencesData = async (req, res) => {
  let Results = await serviceData.UpdateExpencesData(req.body);
  let { Type } = Results;
  if (Type === "error") return res.status(500).json(Results);
  res.json(Results);
};
let searchExpByName = async (req, res) => {
  let Results = await serviceData.searchExpByName(req.body);
  res.json(Results);
};
let getExpencesLists = async (req, res) => {
  let result = await serviceData.getExpensesLists(req.query, req.body);
  res.json(result);
};
let deleteExpenceItem = async (req, res) => {
  let result = await serviceData.deleteExpenceItem(req.body);
  res.json(result);
};
let getExpTransactions = async (req, res) => {
  let Results = await serviceData.getExpTransactions(req.query, req.body);
  res.json(Results);
};
let AddExpencesItems = async (req, res) => {
  let Results = await serviceData.AddExpencesItems(req.body);
  res.json(Results);
};
let registerExpenseTransaction = async (req, res) => {
  let fileName = req?.file?.filename;
  console.log("fileName", fileName);
  req.body.attachedFiles = fileName;

  let Results = await serviceData.registerExpenseTransaction(req.body);
  let { Message } = Results;
  if (Message == "Error") return res.status(400).json(Results);
  res.json(Results);
};
let updateMyExpensesList = async (req, res) => {
  let fileName = req?.file?.filename;
  req.body.fileName = fileName;
  let Results = await serviceData.updateMyExpensesList(req.body);
  let { Message } = Results;
  if (Message == "Error") return res.status(400).json(Results);
  res.json(Results);
};
let updateExpencesItem = async (req, res) => {
  let Results = await serviceData.updateExpencesItem(req.body);
  res.json(Results);
};

module.exports = {
  updateExpencesItem,
  updateMyExpensesList,
  registerExpenseTransaction,
  AddExpencesItems,
  getExpTransactions,
  deleteExpenceItem,
  getExpencesLists,
  controllerUpdateExpencesData,
  searchExpByName,
  deleteExpenceTransaction,
};
