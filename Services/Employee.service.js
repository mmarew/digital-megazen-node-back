const { pool } = require("../Config/db.config");

const getBusinessEmployee = async (body) => {
  try {
    const query = `SELECT employeeId, userIdInEmployee, employeeRole,BusinessIDEmployee, BusinessID, BusinessName, createdDate, ownerId, status, userId, phoneNumber, employeeName
                   FROM employeeTable
                   INNER JOIN Business ON BusinessIDEmployee = BusinessID
                   INNER JOIN usersTable ON userIdInEmployee = userId
                   WHERE BusinessID = ?`;
    const values = [body.businessId];

    const [rows] = await pool.query(query, values);
    // Do something else
    return { data: rows };
  } catch (error) {
    console.error("An error occurred:", error);
    // Handle the error
    return { data: "Error", error: "error to get employees" };
  }
};
const searchEmployee = async (body) => {
  try {
    const { employeeNameToBeSearched, businessId } = body;

    const queryUserTable =
      "SELECT * FROM usersTable WHERE phoneNumber LIKE ? OR employeeName LIKE ?order by employeeName limit 10";
    const valuesUserTable = [
      `%${employeeNameToBeSearched}%`,
      `%${employeeNameToBeSearched}%`,
    ];
    const [userTableRows] = await pool.query(queryUserTable, valuesUserTable);
    const result = userTableRows;

    const queryEmployeeTable = `SELECT * FROM usersTable INNER JOIN employeeTable ON userId = userIdInEmployee WHERE (phoneNumber LIKE ? OR employeeName LIKE ?) AND BusinessIDEmployee = ?`;
    const valuesEmployeeTable = [
      `%${employeeNameToBeSearched}%`,
      `%${employeeNameToBeSearched}%`,
      businessId,
    ];
    const [employeeTableRows] = await pool.query(
      queryEmployeeTable,
      valuesEmployeeTable
    );
    const result1 = employeeTableRows;

    return { data: { result, result1 } };
  } catch (error) {
    console.error("An error occurred:", error);
    // Handle the error
    return { data: "Error", error: "Error occurred while searching employees" };
  }
};

const addEmployee = async (body) => {
  try {
    const { name, phone, businessId, userId } = body;
    const employerId = body.userID;

    const checkQuery =
      "SELECT * FROM employeeTable INNER JOIN Business ON BusinessIDEmployee = BusinessID WHERE userIdInEmployee = ? AND BusinessID = ?";
    const checkValues = [userId, businessId];
    const [checkRows] = await pool.query(checkQuery, checkValues);

    if (checkRows.length > 0) {
      return { data: "data is already registered before" };
    } else {
      const insertQuery =
        "INSERT INTO employeeTable (userIdInEmployee, BusinessIDEmployee, employerId) VALUES (?, ?, ?)";
      const insertValues = [userId, businessId, employerId];
      const [insertResult] = await pool.query(insertQuery, insertValues);
      return { data: "data is inserted correctly." };
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return { data: "Error", error: "An error occurred while adding employee" };
  }
};

// server.post( "removeEmployees/");
const removeEmployees = async (body) => {
  try {
    const query = "DELETE FROM employeeTable WHERE employeeId = ?";
    const values = [body.employeeId];
    const [result] = await pool.query(query, values);
    // Do something else
    return { Status: "deleted", EmployeeId: body.employeeId };
  } catch (error) {
    console.error("An error occurred:", error);
    // Handle the error
    return { err: error };
  }
};
const addEmployeesRoles = async (body) => {
  let { businessId, roles, employeeId } = body;

  try {
    const query =
      "Update employeeTable set employeeRole = ? where employeeId = ?";
    // employees id should be sent from client side
    const values = [JSON.stringify(roles), employeeId];
    const [result] = await pool.query(query, values);

    // Do something else
    if (result.affectedRows > 0)
      return { Message: "Success", EmployeeId: body.employeeId };
    else {
      return { Message: "Error", Error: "unable to update roles" };
    }
  } catch (error) {
    console.error("An error occurred:", error);
    // Handle the error
    return { Message: "Error", Error: "unable to update roles" };
  }
};

module.exports = {
  addEmployeesRoles,
  getBusinessEmployee,
  searchEmployee,
  addEmployee,
  removeEmployees,
};
