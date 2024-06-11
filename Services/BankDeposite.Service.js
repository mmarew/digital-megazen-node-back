const { pool } = require("../Config/db.config");
const { deleteFiles } = require("../Utility/DeleteFiles");

let getDeposit = async (query, body) => {
  try {
    let { businessId, toDate, fromDate, searchTarget } = query;
    let sqlToGetDeposit = `SELECT * FROM bankDeposits,usersTable WHERE bankDeposits.businessId = '${businessId}'  and bankDeposits.depositedBy=usersTable.userId`;
    /////////////////////////////////
    if (searchTarget === "getLast10records") {
      sqlToGetDeposit =
        sqlToGetDeposit + " ORDER BY bankDepositsId DESC LIMIT 10";
    } else
      sqlToGetDeposit =
        sqlToGetDeposit +
        ` and bankDeposits.depositedDate between  '${fromDate}' and
  '${toDate}'`;

    let [rows] = await pool.query(sqlToGetDeposit);
    return { Message: "Success", data: rows };
  } catch (error) {
    console.log("first error", error);
    return { Error: "An error occurred.", Message: "Error" };
  }
};
let updateDeposit = async (req) => {
  try {
    let depositData = JSON.parse(req.body.depositData);
    // console.log("depositData", depositData);
    // return;
    let filename = req?.file?.filename;
    if (!depositData)
      return { Message: "Error", Error: "Deposit data is empty." };
    let {
      businessId,
      depositedAmount,
      bankDepositsId,
      accountNumber,
      depositsDescriptions,
      attachedFilesName,
      depositedDate,
    } = depositData;

    let sqlToUpdate = `UPDATE bankDeposits SET depositedAmount =?,accountNumber = ?,depositsDescriptions=? ,depositedDate=?`;
    let values = [
      depositedAmount,
      accountNumber,
      depositsDescriptions,
      depositedDate,
    ];
    if (filename) {
      values.push(filename);
      sqlToUpdate += ` , attachedFilesName = ?`;
    }
    sqlToUpdate = sqlToUpdate + ` WHERE  bankDepositsId =? `;
    values.push(bankDepositsId);
    /////////////////////////////////
    let [updateRows] = await pool.query(sqlToUpdate, values);
    // if new file exists delete old files
    if (filename) deleteFiles(attachedFilesName);
    console.log("updateRows", updateRows);
    if (updateRows.affectedRows > 0) {
      return {
        Message: "Success",
        data: "Data is updated successfully.",
      };
    }
    return {
      Message: "Error",
      Error: "Data is not updated successfully.",
    };
  } catch (error) {
    console.log("first error", error);
    return { Error: "An error occurred.", Message: "Error in updating data" };
  }
};
let deleteDeposit = async (body) => {
  let { bankDepositsId } = body;

  try {
    let sqlToGetDeposit = `SELECT * FROM bankDeposits WHERE bankDepositsId = '${bankDepositsId}'`;
    let [rows] = await pool.query(sqlToGetDeposit);
    if (rows.length > 0) {
      let sql = `DELETE FROM bankDeposits WHERE bankDepositsId = '${bankDepositsId}' `;
      let [deleteRows] = await pool.query(sql);
      if (deleteRows.affectedRows > 0) {
        return {
          Message: "Success",
          data: "Data is deleted successfully.",
        };
      }
      return {
        Message: "Error",
        Error: "Data is not deleted successfully.",
      };
    }
    return {
      Message: "Error",
      Error: "Data not found.",
    };
  } catch (error) {
    console.log("first error", error);
    return { Error: "An error occurred.", Message: "Error" };
  }
};
let registerDeposit = async (body) => {
  try {
    let {
      userID,
      depositedDate,
      businessId,
      accountNumber,
      depositedAmount,
      clientSideUniqueId,
      depositsDescriptions,
      attachedFilesName,
    } = body;
    let sqlToCheck = `SELECT * FROM bankDeposits WHERE clientSideUniqueId = '${clientSideUniqueId}'`;
    let [rowOfCheck] = await pool.query(sqlToCheck);
    if (rowOfCheck.length > 0) {
      return {
        Error: "This record is already registered before. Thank you.",
        Message: "Error",
      };
    }
    console.log("rowOfCheck", rowOfCheck);
    // return;
    let sqlToInsert = `INSERT INTO bankDeposits(clientSideUniqueId, depositedAmount,depositedDate,depositedBy,businessId,accountNumber,depositsDescriptions,
      attachedFilesName) VALUES('${clientSideUniqueId}','${depositedAmount}','${depositedDate}','${userID}','${businessId}','${accountNumber}','${depositsDescriptions}',
      '${attachedFilesName}')`;
    let [rows] = await pool.query(sqlToInsert);
    console.log("rows", rows);
    if (rows.affectedRows > 0)
      return { Message: "Success", data: "data registered successfully" };
    else return { Message: "Error", Error: "data not registered successfully" };
  } catch (error) {
    console.log("  error in registering deposit", error);
    return {
      Error: "An error occurred in registering deposit.",
      Message: "Error",
    };
  }
};
module.exports = {
  getDeposit,
  updateDeposit,
  deleteDeposit,
  registerDeposit,
};
