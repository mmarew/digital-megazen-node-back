const {
  getBusinessEmployee,
  addEmployee,
  removeEmployees,
  searchEmployee,
} = require("../Services/Employee.service");
const Services = require("../Services/Employee.service");

let getBusinessEmployeeController = async (req, res) => {
  let responces = await getBusinessEmployee(req.body);
  res.json(responces);
};
// addEmployee, removeEmployees;
const addEmployeeController = async (req, res) => {
  let Results = await addEmployee(req.body);
  res.json(Results);
};
const removeEmployeesController = async (req, res) => {
  Results = await removeEmployees(req.body);
  res.json(Results);
};
let searchEmployeeController = async (req, res) => {
  Results = await searchEmployee(req.body);
  res.json(Results);
};
let addEmployeesRoles = async (req, res) => {
  let Results = await Services.addEmployeesRoles(req.body);
  console.log("Results", Results);
  let { Message } = Results;
  if (Message === "Success") {
    res.json(Results);
  } else res.status(400).js(Results);
};
module.exports = {
  addEmployeesRoles,
  getBusinessEmployeeController,
  searchEmployeeController,
  addEmployeeController,
  removeEmployeesController,
};
