let serviceData = require("../Services/Debt.Service");

let getDebtData = async (req, res) => {
  let { body, query } = req;
  console.log("first", body, query);
  let responces = await serviceData.getDebtData({ ...body, ...query });
  let { Message } = responces;
  if (Message == "Success") {
    return res.json(responces);
  }
  //   console.log("responces", responces);
  res.status(400).json(responces);
};
let confirmDebtPayment = async (req, res) => {
  let { body } = req;
  let filename = req?.file?.filename;
  if (!filename) {
    filename = "No file";
  }
  body.attachedFilesName = filename;

  // return;
  let responces = await serviceData.confirmDebtPayment(body);
  let { Message } = responces;
  if (Message == "Success") {
    return res.json(responces);
  }
  res.status(400).json(responces);
};
let deletePaidMoneyData = async (req, res) => {
  let { body } = req;
  let responces = await serviceData.deletePaidMoneyData(body);
  let { Message } = responces;
  if (Message == "Success") {
    return res.json(responces);
  }
  res.status(400).json(responces);
};
let deleteDebtData = async (req, res) => {
  let { body } = req;
  let responces = await serviceData.deleteDebtData(body);
  let { Message } = responces;
  if (Message == "Success") {
    return res.json(responces);
  }
  res.status(400).json(responces);
};
module.exports = {
  getDebtData,
  confirmDebtPayment,
  deletePaidMoneyData,
  deleteDebtData,
};
