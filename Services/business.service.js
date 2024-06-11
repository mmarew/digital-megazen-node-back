const database = require("../Database");
const { pool } = require("../Config/db.config");
require("dotenv").config();
////////////////////
const date = new Date();
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, "0");
const day = String(date.getDate()).padStart(2, "0");
const hour = String(date.getHours()).padStart(2, "0");
const minute = String(date.getMinutes()).padStart(2, "0");

const fullTime = `${year}-${month}-${day} ${hour}:${minute}`;

let createBusiness = async (body) => {
  let { businessName, userID, createdDate } = body;
  let verifyExistance = `SELECT * FROM Business WHERE BusinessName =? and ownerId=?`;

  let [Results] = await pool.query(verifyExistance, [businessName, userID]);
  if (Results.length > 0) {
    return { Message: "Error", Error: "already created business" };
  }
  return await database.createBusiness({
    businessName: businessName,
    ownerId: userID,
    source: fullTime,
    createdDate: createdDate,
  });
};

let deleteBusiness = async (body) => {
  let responces = await database.deleteBusiness(body);
  return responces;
};

let getBusiness = async (userID) => {
  try {
    let getBusiness = `SELECT * FROM Business, usersTable WHERE ownerId = ? and usersTable.userId = Business.ownerId`;
    let myBusiness = "";
    let employeerBusiness = "";
    let [rows] = await pool.query(getBusiness, [userID]);
    myBusiness = rows;
    let getEmployeerBusiness = `SELECT * FROM employeeTable, Business, usersTable WHERE userIdInEmployee = ? AND Business.BusinessID = employeeTable.BusinessIDEmployee and Business.ownerId = usersTable.userId`;
    let [row1] = await pool.query(getEmployeerBusiness, [userID]);
    employeerBusiness = row1;
    return { myBusiness, employeerBusiness };
  } catch (err) {
    console.error(err);
    return { error: "Invalid token" };
  }
};
let updateBusinessName = async (body) => {
  let { businessname, targetBusinessId } = body;
  try {
    const query_updateBusinessName =
      "UPDATE Business SET businessName = ? WHERE businessId = ?";
    const values_updateBusinessName = [businessname, targetBusinessId];
    let results = await pool.query(
      query_updateBusinessName,
      values_updateBusinessName
    );

    return { data: "updated successfully" };
  } catch (error) {
    console.log(error);
    return { error };
  }
};
let removeEmployeersBusiness = async (body) => {
  try {
    const { userID, businessId } = body;
    const getEmployeerBusiness = `SELECT * FROM employeeTable WHERE userIdInEmployee = ? AND BusinessIDEmployee = ?`;
    const getEmployeerBusinessValues = [userID, businessId];
    if (userID === null || businessId === null) {
      return { data: "NoDataLikeThis" };
    }
    const [results] = await pool.query(
      getEmployeerBusiness,
      getEmployeerBusinessValues
    );

    if (results.length > 0) {
      const deleteData = `DELETE FROM employeeTable WHERE userIdInEmployee = ? AND BusinessIDEmployee = ?`;
      const deleteDataValues = [userID, businessId];

      const [resultOfDelete] = await pool.query(deleteData, deleteDataValues);

      if (resultOfDelete.affectedRows > 0) {
        return { data: resultOfDelete };
      } else {
        return { data: "alreadyDeleted" };
      }
    } else {
      return { data: "NoDataLikeThis" };
    }
  } catch (error) {
    console.error("Error in removeEmployeersBusiness:", error);
    return res.status(500).json({ data: "Internal Server Error" });
  }
};
module.exports = {
  removeEmployeersBusiness,
  createBusiness,
  getBusiness,
  deleteBusiness,
  updateBusinessName,
};
