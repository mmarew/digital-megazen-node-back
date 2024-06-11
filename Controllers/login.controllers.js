const loginService = require("../Services/login.service");

let login = async (req, res) => {
  try {
    const { phoneNumber, Password } = req.body;
    // console.log("req.body", req.body);
    // return res.json({ name: req.body });
    const result = await loginService.login(phoneNumber, Password);
    let { Message } = result;
    if (Message == "Error") res.status(400).json(result);
    else res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

let verifyLoginController = async (req, res) => {
  let result = await loginService.verifyLogin(req.body);
  res.json(result);
};
let requestPasswordReset = async (req, res) => {
  let result = await loginService.requestPasswordReset(req.body);
  res.json(result);
};
let verifyPin = async (req, res) => {
  let result = await loginService.verifyPin(req.body);
  let { Message } = result;
  if (Message == "Error") return res.status(400).json(result);
  res.json(result);
};
let forgetRequest = async (req, res) => {
  let result = await loginService.forgetRequest(req.body);
  let { Message } = result;

  if (Message == "Error") return res.status(400).json(result);
  res.json(result);
};
let updateChangeInpassword = async (req, res) => {
  let result = await loginService.updateChangeInpassword(req.body);
  res.json(result);
};
// let getPasswordResetPin = async (req, res) => {
//   let result = await loginService.getPasswordResetPin(req.body);
//   if (result == "error" || !result) {
//     return res.status(400).json({ Message: "Error in getting data" });
//   }
//   res.status(200).json(result);
// };
module.exports = {
  // getPasswordResetPin,
  updateChangeInpassword,
  forgetRequest,
  login,
  verifyLoginController,
  requestPasswordReset,
  verifyPin,
};
// 0641135474837001;
