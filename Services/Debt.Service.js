const { pool } = require("../Config/db.config");
const { getUniqueBusinessName } = require("../Utility/UniqueBusinessName");
const { deleteFiles } = require("../Utility/DeleteFiles");
let getDebtData = async (body) => {
  console.log("body", body);
  try {
    let { businessId, userID, searchTarget } = body;
    let businessName = await getUniqueBusinessName(businessId, userID);
    if (businessName == "you are not owner of this business") {
      return { data: businessName };
    }

    targetStatus = `debtStatus = 'initial' or debtStatus= 'partially paid'`;
    if (searchTarget == "History") {
      targetStatus += ` or debtStatus = 'fully paid' `;
    }
    let getDebtSql = `select * from dailyTransaction , ${businessName}_products where purchasePaymentType='On debt' and (${targetStatus}) and ${businessName}_products.ProductId = dailyTransaction.ProductId and businessId=${businessId}`;

    const [Information] = await pool.query(getDebtSql);
    let sqlToGetPaiedMoney = `select * from debtPayment,usersTable  where businessId='${businessId}' and userId=debtPayment.paierId`;
    const [paiedMoney] = await pool.query(sqlToGetPaiedMoney);
    return { Message: "Success", data: Information, paiedMoney };
  } catch (error) {
    console.log("error", error);
    return { Message: "Error", Error: "unable to fetch data" };
  }
};

const updateStatusOfDebt = async ({ dailySalesId, tobePaid, paidAmount }) => {
  let Status = "partially paid";
  if (Number(tobePaid) - Number(paidAmount) === 0) {
    Status = "fully paid";
  }

  // update the dailyTransaction table to set the debt status to partially paid or fully paid depend on the paid amount

  try {
    let sqlToUpdateDailyTransaction = `update dailyTransaction set debtStatus = '${Status}' where dailySalesId = ${dailySalesId}`;
    let [updateResult] = await pool.query(sqlToUpdateDailyTransaction);
    return { Message: "Success" };
  } catch (error) {
    console.log("updateStatusOfDebt error", error);
  }
};
const getPaidMoney = async ({ dailySalesId }) => {
  // to get all the paied debt money
  let sqlToGetPaiedMoney = `select * from debtPayment where dailySalesId=${dailySalesId}`;
  const [paiedMoney] = await pool.query(sqlToGetPaiedMoney);
  let previouslyPaidAmount = 0;
  // sum all the paied money
  paiedMoney.forEach((item) => {
    previouslyPaidAmount += item.paidAmount;
  });
  // paidAmount:
  console.log("previouslyPaidAmount", previouslyPaidAmount);

  let sqlToGetDebts = `select purchaseQty,unitCost from dailyTransaction where dailySalesId=${dailySalesId}`;
  let [selectData] = await pool.query(sqlToGetDebts);
  console.log("selectData", selectData);
  // return;
  let { purchaseQty, unitCost } = selectData[0];
  let totalDebt = Number(purchaseQty) * Number(unitCost);
  console.log("totalDebt", totalDebt);
  // calculate the tobePaid
  let tobePaid = totalDebt - previouslyPaidAmount;
  return tobePaid;
};
let confirmDebtPayment = async (body) => {
  console.log("body", body);
  let { depositData, attachedFilesName, userID } = body;
  depositData = JSON.parse(depositData);
  let {
    paidAmount,
    paidDate,
    Descriptions,
    businessId,
    paymentType,
    dailySalesId,
  } = depositData;
  try {
    const tobePaid = await getPaidMoney({ dailySalesId });
    // get the total debt using unit cost and purcha
    // if paidAmount is greater than tobePaid then return error message and stop here
    if (Number(tobePaid) < Number(paidAmount)) {
      return {
        Message: "Error",
        Error: `Your current paid amount ${paidAmount} is greater than not debt amount ${tobePaid} by amount ${
          Number(paidAmount) - Number(tobePaid)
        } which is not allowed`,
      };
    }
    //if there is no error  register the payment to the database in the debtPayment table
    let sqlToRegisterPayment = `insert into debtPayment (
      dailySalesId,
      paierId,
      paidAmount,
    paidDate,
    Descriptions,
    businessId,
    paymentType,
    attachedDebtPaymbentFilesName
  ) values (?,?,?,?,?,?,?,?)`;
    let values = [
      dailySalesId,
      userID,
      paidAmount,
      paidDate,
      Descriptions,
      businessId,
      paymentType,
      attachedFilesName,
    ];

    let [results] = await pool.query(sqlToRegisterPayment, values);
    // if there is an error in registering the payment return error
    if (results.affectedRows == 0) {
      return { Message: "Error", Error: "unable to register payment data" };
    }
    //if there is no error set the debt status dailyTransaction to partially paid or fully paid depend on the paid amount

    let updateResponces = await updateStatusOfDebt({
      dailySalesId,
      tobePaid,
      paidAmount,
    });
    let { Message } = updateResponces;
    if (Message != "Success") {
      return { Message: "Error", Error: "unable to register payment data" };
    }
    if (tobePaid === Number(paidAmount)) {
      // tell the user that he has paid all of the debt
      return {
        Message: "Success",
        data: "You have paid all the debt",
      };
    }
    // tell the user that he has paid part of the debt
    return { Message: "Success", data: '"you have paid part of the debt' };
  } catch (error) {
    console.log("error", error);
    return { Message: "Error", Error: "unable to register payment data" };
  }
};
const deletePaidMoneyData = async (body) => {
  let { paymentId, dailySalesId, paidAmount, attachedDebtPaymbentFilesName } =
    body;
  console.log("body", body);
  // return;
  try {
    let sqlToRegisterPayment = `delete from debtPayment where paymentId=?`;
    let values = [paymentId];
    let [results] = await pool.query(sqlToRegisterPayment, values);
    deleteFiles(attachedDebtPaymbentFilesName);
    const tobePaid = await getPaidMoney({ dailySalesId });
    // update the dailyTransaction table to set the debt status to partially paid or fully paid depend on the paid amount
    let updateResponces = await updateStatusOfDebt({
      dailySalesId,
      tobePaid,
      // set paidAmount to 0 because no amount is paid but previouly paid amount is deleted from the database so now it is 0;
      paidAmount: 0,
    });
    return { Message: "Success", data: results };
  } catch (error) {
    console.log("error", Error);
    return { Message: "Error", Error: "unable to register payment data" };
  }
};
let deleteDebtData = async (body) => {
  try {
    console.log("body", body);
    let { deletableItem, userID } = body;
    let { dailySalesId } = deletableItem;
    let deleteDebtdata = `delete from debtPayment where dailySalesId=?`;
    let values = [dailySalesId];
    let [results] = await pool.query(deleteDebtdata, values);
    let sqlToDeleteTransactions = `delete from dailyTransaction where dailySalesId=?`;
    let values2 = [dailySalesId];
    console.log("results", results);
    let [results2] = await pool.query(sqlToDeleteTransactions, values2);
    console.log("results2", results2);
    return { Message: "Success", data: "deleted" };
  } catch (error) {
    return { Message: "Error", Error: "unable to delete payment data" };
  }
};
module.exports = {
  getDebtData,
  confirmDebtPayment,
  deletePaidMoneyData,
  deleteDebtData,
};
