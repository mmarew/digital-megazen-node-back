const { pool } = require("../Config/db.config");
let tokenKey = process.env.tokenKey;
let jwt = require("jsonwebtoken");
let getUniqueBusinessName = async (businessId, userID) => {
  try {
    let getBusinessData = `select * from Business where BusinessID='${businessId}' and ownerId='${userID}'`;
    // userIdInEmployee int,BusinessIDEmployee int, employerId
    let selectAsEmployee = `select * from employeeTable,Business where userIdInEmployee='${userID}' and BusinessIDEmployee='${businessId}'  and BusinessID=BusinessIDEmployee`;
    let [businessData] = await pool.query(getBusinessData);
    if (businessData.length == 0) {
      // check if u r employee
      let [employeeResult] = await pool.query(selectAsEmployee);
      if (employeeResult.length > 0) {
        let { uniqueBusinessName } = employeeResult[0];
        return uniqueBusinessName;
      }
      return "you are not owner of this business";
    }

    let { uniqueBusinessName } = businessData[0];
    return uniqueBusinessName;
  } catch (error) {
    console.log("error", error);
    return "Error in server 456";
  }
};
module.exports.getUniqueBusinessName = getUniqueBusinessName;
