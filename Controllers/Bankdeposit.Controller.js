const Services = require("../Services/BankDeposite.Service");
const getDeposit = async (req, res) => {
  let Result = await Services.getDeposit(req.query, req.body);
  let { Message } = Result;
  if (Message == "Error") return res.status(400).json(Result);
  res.json(Result);
};
const updateDeposit = async (req, res) => {
  let Result = await Services.updateDeposit(req);

  let { Message } = Result;
  if (Message == "Error") return res.status(400).json(Result);
  res.json(Result);
};
const deleteDeposit = async (req, res) => {
  let Result = await Services.deleteDeposit(req.body, req.query);
  let { Message } = Result;
  if (Message == "Error") return res.status(400).json(Result);
  res.json(Result);
};
const registerDeposit = async (req, res) => {
  let filename = req?.file?.filename;
  let { textData } = req.body;
  let { userID } = req;
  textData = JSON.parse(textData);
  if (!filename) filename = "No file";
  textData.attachedFilesName = filename;
  let Result = await Services.registerDeposit({ ...textData, userID });
  let { Message } = Result;
  if (Message == "Error") return res.status(400).json(Result);
  res.json(Result);
};
module.exports = {
  getDeposit,
  updateDeposit,
  deleteDeposit,
  registerDeposit,
};
