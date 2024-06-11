const tokenKey = process.env.tokenKey;
const { pool } = require("../Config/db.config");
const { getUniqueBusinessName } = require("../Utility/UniqueBusinessName");
const jwt = require("jsonwebtoken");
const { deleteFiles } = require("../Utility/DeleteFiles");
let getCreditList = async (req) => {
  try {
    let userId = req.body.userID;

    let {
      businessName,
      businessId,
      fromDate,
      toDate,
      searchTarget,
      ProductId,
      creditSearchTarget,
    } = req.query;
    console.log("searchTarget", searchTarget, " ProductId", ProductId);
    console.log("creditSearchTarget", creditSearchTarget);
    // return;
    businessName = await getUniqueBusinessName(businessId, userId);
    if (businessName == "you are not owner of this business") {
      return { data: businessName };
    }
    let SelectOnCreditFromDaily = "",
      soldInDaily_SoldOncredits = [],
      sqlToCollectedMoneyFromSingleSales = "";
    // select items sold in credit from daily transaction which is  on credit and all money are not collected
    let salesTypeValues = ` salesTypeValues = 'On credit' or  salesTypeValues = 'Partially paied' or salesTypeValues = 'Partially paid' `;
    // select items sold in credit from daily transaction which is  on credit and all money are not collected or partially collected or fully collected
    if (creditSearchTarget == "History") {
      salesTypeValues += `  or salesTypeValues='Credit paied' `;
    }
    SelectOnCreditFromDaily = `select * from dailyTransaction , ${businessName}_products where (${salesTypeValues}) and ${businessName}_products.ProductId = dailyTransaction.ProductId and businessId=${businessId}`;

    // return;
    productsTable = `${businessName}_products`;

    if (fromDate !== "notInDateRange" && toDate !== "notInDateRange") {
      //Credit collecteds only from dailyTransaction in specific date

      sqlToCollectedMoneyFromSingleSales = `SELECT * FROM creditCollection, dailyTransaction, ${productsTable} WHERE creditCollection.businessId='${businessId}' and creditCollection.collectionDate BETWEEN '${fromDate}' AND '${toDate}' and dailyTransaction.dailySalesId = creditCollection.transactionId   and ${productsTable}.ProductId = creditCollection.targtedProductId`;
      //////////////////////////////////////////////////////////
      let dateRanges = ` and registeredTimeDaily between '${fromDate}' and '${toDate}'`;
      SelectOnCreditFromDaily += dateRanges;
    }
    if (searchTarget == "Single items Buy And Sell") {
      SelectOnCreditFromDaily =
        SelectOnCreditFromDaily +
        ` and dailyTransaction.ProductId = '${ProductId}'`;
    }
    let partiallyPaidInTotal = [];
    let transactionIdList = [];
    let FromSingleSales = [];
    const [Information] = await pool.query(SelectOnCreditFromDaily);
    soldInDaily_SoldOncredits = Information;
    for (const Info of Information) {
      const transactionId = Info.dailySalesId;
      transactionIdList.push(transactionId);
    }
    // Check for date range conditions
    if (
      fromDate === "notInDateRange" &&
      toDate === "notInDateRange" &&
      transactionIdList.length > 0
    ) {
      sqlToCollectedMoneyFromSingleSales = `SELECT * FROM creditCollection, dailyTransaction, ${productsTable} WHERE creditCollection.businessId=? and dailyTransaction.dailySalesId = creditCollection.transactionId and ${productsTable}.ProductId = creditCollection.targtedProductId and  creditCollection.transactionId IN (?)`;
      // Execute the query using the pool instance and sanitized transaction IDs

      [FromSingleSales] = await pool.query(sqlToCollectedMoneyFromSingleSales, [
        businessId,
        transactionIdList,
      ]);
      partiallyPaidInTotal = [...FromSingleSales];
    } else {
      if (sqlToCollectedMoneyFromSingleSales != "")
        [FromSingleSales] = await pool.query(
          sqlToCollectedMoneyFromSingleSales
        );
      partiallyPaidInTotal = [...FromSingleSales];
    }
    return {
      partiallyPaidInTotal,

      soldInDaily_SoldOncredits,
    };
  } catch (error) {
    console.log("error", error);
    return { data: "error no 891" };
  }
};
let updatePartiallyPaidInfo = async (body) => {
  try {
    // console.log("in updatePartiallyPaidInfo body", body);
    // return;
    const { DeletableInfo } = body;
    const sanitizedCollectionIds = DeletableInfo.map((info) =>
      String(info.collectionId).replace(/'/g, "\\'")
    );
    let { collectionAttachedFiles } = DeletableInfo[0];
    // console.log("collectionAttachedFiles", collectionAttachedFiles);
    // return;
    const sql = `DELETE FROM creditCollection WHERE collectionId IN (?)`;
    await pool.query(sql, [sanitizedCollectionIds]);
    deleteFiles(collectionAttachedFiles);
    return { Message: "Success", data: "Updated successfully" };
  } catch (error) {
    console.error(error);
    return { Type: "error", error: "Internal Server Error" };
  }
};
let confirmPayments = async (body) => {
  try {
    let { textData, attachedFilesName } = body;
    console.log("attachedFilesName", attachedFilesName);
    // return;
    textData = JSON.parse(textData);
    const {
      businessId,
      userID,
      creditPaymentDate,
      collectedAmount,
      data: { dailySalesId, ProductId, creditsalesQty, unitPrice },
    } = textData;

    let previouslycollectedAmount = 0;

    const selectQuery = `SELECT * FROM creditCollection WHERE transactionId='${dailySalesId}' AND businessId='${businessId}' AND registrationSource='Single'`;
    const [results] = await pool.query(selectQuery);

    results.forEach((result) => {
      previouslycollectedAmount += Number(result.collectionAmount);
    });

    const SalesIncredit = creditsalesQty * unitPrice;
    const tobeCollected = SalesIncredit - previouslycollectedAmount;

    if (tobeCollected <= 0) {
      await pool.query(
        `UPDATE dailyTransaction SET salesTypeValues='Credit paied' WHERE dailySalesId='${dailySalesId}'`
      );
      return {
        data: `You have collected all of your money previously. Now you can't collect money again`,
      };
    }

    if (Number(collectedAmount) > tobeCollected) {
      return {
        data: `You can't collect money more  than remaining amount`,
      };
    }

    if (tobeCollected === Number(collectedAmount)) {
      await pool.query(
        `UPDATE dailyTransaction SET salesTypeValues='Credit paied' WHERE dailySalesId='${dailySalesId}'`
      );
    } else if (tobeCollected > Number(collectedAmount)) {
      await pool.query(
        `UPDATE dailyTransaction SET salesTypeValues='Partially paid' WHERE dailySalesId='${dailySalesId}'`
      );
    }

    const InsertQuery = `INSERT INTO creditCollection (collectedBy,collectionDate, collectionAmount, transactionId,  businessId, targtedProductId,collectionAttachedFiles ) 
    VALUES ('${userID}','${creditPaymentDate}', '${collectedAmount}',  '${dailySalesId}',  '${businessId}', '${ProductId}','${attachedFilesName}')`;

    const [response] = await pool.query(InsertQuery);
    console.log("response9999999999", response);
    if (response.affectedRows > 0) {
      return { Message: "success", data: "SUCCESS" };
    }
    console.log("response====", response);
  } catch (error) {
    console.error(error);
    return { Type: "error", error: "Internal Server Error" };
  }
};
module.exports = { getCreditList, updatePartiallyPaidInfo, confirmPayments };
