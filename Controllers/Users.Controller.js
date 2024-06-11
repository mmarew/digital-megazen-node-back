const serviceData = require("../Services/Users.Service");

let RegisterUsersController = async (req, res) => {
  let result = await serviceData.registerUsers(req.body);
  if (!result) {
    res.status(500).json({ data: "error in user registration" });
  } else if (result.Message == "Error") {
    res.status(400).json(result);
  } else if (result.Message == "Success") {
    res.status(200).json(result);
  } else {
    res.status(500).json({ data: "error in user registration" });
  }
};

let getMyProfile = async (req, res) => {
  let results = await serviceData.getMyProfile(req.body);
  res.json(results);
};
let deleteUsers = async (req, res) => {
  let results = await serviceData.deleteUsers(req.body);
  res.json(results);
};
module.exports = { RegisterUsersController, getMyProfile, deleteUsers };
