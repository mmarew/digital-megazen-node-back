const {
  getBusinessEmployeeController,
  searchEmployeeController,
  addEmployeeController,
  removeEmployeesController,
  addEmployeesRoles,
} = require("../Controllers/Employee.Controller");
const { authMiddleware, authMiddleware2 } = require("../middleware/Auth");

let Router = require("express").Router();
Router.post(
  "/getBusinessEmployee",
  authMiddleware,
  getBusinessEmployeeController
);
Router.post("/searchEmployee/", authMiddleware, searchEmployeeController);
Router.post("/addEmployee/", authMiddleware, addEmployeeController);
Router.post(
  "/removeEmployees/",
  authMiddleware,
  authMiddleware2,
  removeEmployeesController
);
Router.post("/Employees/addEmployeesRoles/", authMiddleware, addEmployeesRoles);
// Router.get("/");
// addEmployee, removeEmployees; addEmployeeController,
//   removeEmployeesController,
module.exports = Router;
