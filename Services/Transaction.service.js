const { pool } = require("../Config/db.config");
const { isValidDateFormat, DateFormatter } = require("../DateFormatter");
const { getUniqueBusinessName } = require("../Utility/UniqueBusinessName");
const updateNextInventory = async ({
  dailySalesId,
  mainProductId,
  businessId,
  inventoryItem,
  userID,
  registeredTimeDaily,
}) => {
  try {
    const uniqueBusinessName = await getUniqueBusinessName(businessId, userID);
    if (
      uniqueBusinessName === "you are not the owner of this business" ||
      uniqueBusinessName === "Error"
    ) {
      return { data: "you are not the owner of this business" };
    }
    const sqlToGetNextInventory = `SELECT * FROM dailyTransaction WHERE mainProductId=? AND businessId=?  AND registeredTimeDaily>=?  ORDER BY registeredTimeDaily, dailySalesId ASC`;
    const values = [mainProductId, businessId, registeredTimeDaily];

    let [nextResult] = await pool.query(sqlToGetNextInventory, values);
    // return;
    let filteredArray = [];
    nextResult.map((result) => {
      if (
        DateFormatter(registeredTimeDaily) ===
        DateFormatter(result.registeredTimeDaily)
      ) {
        if (result.dailySalesId > dailySalesId) {
          filteredArray.push(result);
        } else {
        }
      } else {
        filteredArray.push(result);
      }
    });
    nextResult = filteredArray;

    const updateSingleRecord = async (Result) => {
      const { purchaseQty, salesQty, creditsalesQty, brokenQty, dailySalesId } =
        Result;
      inventoryItem =
        Number(inventoryItem) +
        Number(purchaseQty) -
        Number(salesQty) -
        Number(creditsalesQty) -
        Number(brokenQty);
      const id = Result.dailySalesId;

      const updateQuery = `UPDATE dailyTransaction SET inventoryItem='${inventoryItem}'  WHERE dailySalesId='${id}'`;
      await pool.query(updateQuery);
    };

    for (const result of nextResult) {
      await updateSingleRecord(result);
    }

    return { data: "success" };
  } catch (error) {
    console.error("Error:", error);
    return { data: error.message };
  }
};
let getPreviousDayInventory = async (
  dailySalesId,
  mainProductId,
  businessId,
  registeredTimeDaily
) => {
  let sqlToGetPrevInventori = `select * from dailyTransaction where dailySalesId<'${dailySalesId}' and registeredTimeDaily<='${DateFormatter(
    registeredTimeDaily
  )}' and mainProductId='${mainProductId}' and businessId='${businessId}' order by registeredTimeDaily desc, dailySalesId desc limit 1`;

  let [prevResult] = await pool.query(sqlToGetPrevInventori);
  let inventoryItem = 0;
  if (prevResult.length > 0) inventoryItem = prevResult[0]?.inventoryItem;

  return [inventoryItem, prevResult];
};

let registerSinglesalesTransaction = async (body) => {
  console.log("registerSinglesalesTransaction", body);
  // return;
  try {
    let {
      attachedFilesName,
      debtDueDate,
      Description,
      brokenQty,
      businessId,
      purchaseQty,
      salesQty,
      ProductId,
      selectedDate,
      salesType,
      creditPaymentDate,
      items,
      token,
      unitPrice,
      useNewPrice,
      userID,
      newUnitCost,
      useNewCost,
      purchasePaymentType,
    } = body;
    items = JSON.parse(items);
    if (!debtDueDate) debtDueDate = "1900-01-01";
    // useNewCost, newUnitCost
    console.log(
      "newUnitCost ===== ",
      newUnitCost,
      "useNewCost,=====",
      useNewCost
    );
    // return {};

    let { productsUnitCost, mainProductId, productsUnitPrice } = items;
    if (useNewCost === "true" || useNewCost === true) {
      productsUnitCost = Number(newUnitCost);
    }
    if (useNewPrice) items.productsUnitPrice = unitPrice;
    if (useNewPrice === false || useNewPrice === "false") {
      unitPrice = Number(productsUnitPrice);
    }
    if (mainProductId == null) mainProductId = ProductId;
    // let { userID } = JWT.verify(token, tokenKey);
    let salesTypeColumn = "salesQty";
    if (salesType == "On credit") {
      salesTypeColumn = "creditsalesQty";
    }
    let sqlToGetPreviousInventory = `select * from dailyTransaction where   registeredTimeDaily<=? and mainProductId=? and businessId=? order by registeredTimeDaily DESC,dailySalesId DESC limit 1`;
    let prevVal = [selectedDate, mainProductId, businessId];
    let [inventoryData] = await pool.query(sqlToGetPreviousInventory, prevVal);
    let inventoryItem = 0;

    if (inventoryData.length > 0)
      inventoryItem = inventoryData[0].inventoryItem;
    inventoryItem =
      Number(inventoryItem) +
      Number(purchaseQty) -
      Number(salesQty) -
      Number(brokenQty);

    const insertsQuery = `INSERT INTO dailyTransaction (mainProductId,purchaseQty, ${salesTypeColumn},salesTypeValues,creditPaymentDate,businessId, ProductId, brokenQty, Description, registeredTimeDaily, itemDetailInfo, registeredBy,inventoryItem,unitPrice,unitCost,purchasePaymentType,debtDueDate,attachedFilesName) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    const values = [
      mainProductId,
      purchaseQty,
      salesQty,
      salesType,
      creditPaymentDate,
      businessId,
      ProductId,
      brokenQty,
      Description,
      selectedDate,
      JSON.stringify(items),
      userID,
      inventoryItem,
      unitPrice,
      productsUnitCost,
      purchasePaymentType,
      debtDueDate,
      attachedFilesName,
    ];
    // console.log("values====", values);
    // return;
    let [result] = await pool.query(insertsQuery, values);

    console.log("result=====", result);
    let nextResult = await updateNextInventory({
      dailySalesId: result.insertId,
      mainProductId,
      businessId,
      inventoryItem,
      token,
      ProductId,
      registeredTimeDaily: selectedDate,
      userID,
    });
    return { Message: "success", data: nextResult };
  } catch (error) {
    console.log(" error in registerSinglesalesTransaction", error);
    return { Message: "Error", Error: error.message };
  }
};
let getDailyTransaction = async (body) => {
  try {
    let getTransaction = "";
    let {
      fromDate,
      toDate,
      productId,
      businessId,
      currentDates,
      businessName,
      userID,
      searchTarget,
      productName,
    } = body;
    // return;
    businessName = await getUniqueBusinessName(businessId, userID);
    if (businessName == "you are not owner of this business") {
      return { data: "Error", Error: businessName };
    }
    let query = null,
      values = null;
    if (searchTarget === "getLast10records") {
      query = `SELECT * FROM ?? AS dt JOIN ?? AS bp JOIN ?? as ut  ON ut.userId=dt.registeredBy and  bp.ProductId = dt.ProductId    WHERE dt.businessId = ?  order by registeredTimeDaily desc limit 10  `;
      values = [
        "dailyTransaction",
        `${businessName}_products`,
        "usersTable",
        businessId,
      ];
    } else if (searchTarget === "getLastRecord") {
      query = `SELECT * FROM ?? AS dt JOIN ?? AS bp JOIN ?? as ut  ON ut.userId=dt.registeredBy and  bp.ProductId = dt.ProductId    WHERE dt.businessId = ?  order by dailySalesId desc limit 1  `;
      values = [
        "dailyTransaction",
        `${businessName}_products`,
        "usersTable",
        businessId,
      ];
    } else if (
      searchTarget === "All Buy Sell and Expences" ||
      searchTarget == "All Buy And Sell only"
    ) {
      // get all transaction without filter
      query = `SELECT * FROM ?? AS dt JOIN ?? AS bp JOIN ?? as ut  ON ut.userId=dt.registeredBy and  bp.ProductId = dt.ProductId    WHERE dt.businessId = ?  AND dt.registeredTimeDaily = ?  `;
      values = [
        "dailyTransaction",
        `${businessName}_products`,
        "usersTable",
        businessId,
        DateFormatter(currentDates),
      ];

      if (isValidDateFormat(fromDate) && isValidDateFormat(toDate)) {
        query = `SELECT * FROM ?? AS dt JOIN ?? AS bp JOIN ?? as ut  ON ut.userId=dt.registeredBy and  bp.ProductId = dt.ProductId WHERE dt.businessId = ?  AND dt.registeredTimeDaily between '${DateFormatter(
          fromDate
        )}' and '${DateFormatter(toDate)}'`;
        values = [
          "dailyTransaction",
          `${businessName}_products`,
          "usersTable",
          businessId,
        ];
      }
    } else if (searchTarget === "getSingleTransaction") {
      // get transaction by productName
      query = `SELECT * FROM ?? AS dt JOIN ?? AS bp JOIN ?? as ut  ON ut.userId=dt.registeredBy and  bp.ProductId = dt.ProductId    WHERE dt.businessId = ?  AND dt.registeredTimeDaily = ? and bp.productName like ? `;
      values = [
        "dailyTransaction",
        `${businessName}_products`,
        "usersTable",
        businessId,
        currentDates,
        `${productName}%`,
      ];
      if (isValidDateFormat(fromDate) && isValidDateFormat(toDate)) {
        query = `SELECT * FROM ?? AS dt JOIN ?? AS bp JOIN ?? as ut  ON ut.userId=dt.registeredBy and  bp.ProductId = dt.ProductId WHERE dt.businessId = ?  AND dt.registeredTimeDaily between '${fromDate}' and '${toDate}' and bp.productName like ?`;
        values = [
          "dailyTransaction",
          `${businessName}_products`,
          "usersTable",
          businessId,
          `%${productName}%`,
        ];
      }
      // getSingleTransaction
      // productName;
    } else if (searchTarget == "Single items Buy And Sell") {
      // get transaction by productId
      query = `SELECT * FROM ?? AS dt JOIN ?? AS bp JOIN ?? as ut ON bp.ProductId = dt.ProductId and ut.userId = dt.registeredBy WHERE dt.businessId = ?  AND dt.ProductId =? AND   dt.registeredTimeDaily between ? and ?`;

      values = [
        "dailyTransaction",
        `${businessName}_products`,
        "usersTable",
        businessId,
        productId,
        DateFormatter(fromDate),
        DateFormatter(toDate),
      ];
    }

    let [rows] = await pool.query(query, values);
    return { data: rows, getTransaction };
  } catch (error) {
    console.log("error", error);
    return { data: "error" };
  }
};
let deleteTransactions = async (body) => {
  try {
    let {
      dailySalesId,
      mainProductId,
      businessId,
      ProductId,
      token,
      registeredTimeDaily,
      userID,
    } = body;
    if (mainProductId == null) mainProductId = ProductId;

    const [inventoryItem] = await getPreviousDayInventory(
      dailySalesId,
      mainProductId,
      businessId,
      registeredTimeDaily
    );

    const deleteSql = `DELETE FROM dailyTransaction WHERE dailySalesId = ?`;
    let [results] = await pool.query(deleteSql, [dailySalesId]);

    let updateResults = updateNextInventory({
      dailySalesId,
      mainProductId,
      businessId,
      inventoryItem,
      token,
      userID,
      ProductId,
      registeredTimeDaily,
    });

    return { Message: "Success", data: "success" };
  } catch (error) {
    console.error("An error occurred:", error);
    return { data: "error", error: "error no 23" };
  }
};
let updateDailyTransactions = async (body) => {
  // console.log("first body", body);
  // return;
  try {
    let {
      unitPrice,
      newlyAttachedFilesName,
      unitCost,
      registeredTimeDaily,
      ProductId,
      businessId,
      dailySalesId,
      Description,
      brokenQty,
      creditPaymentDate,
      creditsalesQty,
      purchaseQty,
      salesQty,
      salesTypeValues,
      userID,
      itemDetailInfo,
      debtDueDate,
      purchasePaymentType,
    } = body;
    console.log("creditsalesQty", creditsalesQty);
    // change values to number starts here
    unitCost = Number(unitCost);
    brokenQty = Number(brokenQty);
    creditsalesQty = Number(creditsalesQty);
    purchaseQty = Number(purchaseQty);
    salesQty = Number(salesQty);
    if (isNaN(unitPrice)) unitPrice = 0;
    if (isNaN(brokenQty)) brokenQty = 0;
    if (isNaN(purchaseQty)) purchaseQty = 0;
    if (isNaN(salesQty)) salesQty = 0;
    if (isNaN(creditsalesQty)) creditsalesQty = 0;
    // change values to number ends here
    let { mainProductId } = body;

    const itemDetailInfoObject = JSON.parse(itemDetailInfo);
    if (unitCost) itemDetailInfoObject.unitCost = unitCost;

    if (!mainProductId) mainProductId = ProductId;

    const [inventoryItem, prevResult] = await getPreviousDayInventory(
      dailySalesId,
      mainProductId,
      businessId,
      registeredTimeDaily
    );

    const updatedInventoryItem =
      inventoryItem + purchaseQty - salesQty - creditsalesQty - brokenQty;
    //  + purchaseQty - salesQty - creditsalesQty - brokenQty;

    let updateQuery = `UPDATE dailyTransaction SET purchaseQty=?, purchasePaymentType=?, debtDueDate=?, unitCost=?, salesQty=?, creditsalesQty=?, salesTypeValues=?, creditPaymentDate=?, brokenQty=?, Description=?, inventoryItem=?, itemDetailInfo=?, unitPrice=? `;
    if (newlyAttachedFilesName) {
      updateQuery += " , attachedFilesName=? WHERE dailySalesId=?";
    } else {
      updateQuery += " WHERE dailySalesId=?";
    }

    let updateValues = [
      purchaseQty,
      purchasePaymentType,
      debtDueDate,
      unitCost,
      salesQty,
      creditsalesQty,
      salesTypeValues,
      creditPaymentDate,
      brokenQty,
      Description,
      updatedInventoryItem,
      JSON.stringify(itemDetailInfoObject),
      unitPrice,
    ];
    if (newlyAttachedFilesName) {
      updateValues.push(newlyAttachedFilesName);
      updateValues.push(dailySalesId);
    } else {
      updateValues.push(dailySalesId);
    }
    const [updateResult] = await pool.query(updateQuery, updateValues);
    if (updateResult.affectedRows > 0) {
      await updateNextInventory({
        dailySalesId,
        mainProductId,
        businessId,
        inventoryItem: updatedInventoryItem,
        userID,
        ProductId,
        registeredTimeDaily,
      });

      return { Message: "Success", data: "update successfully" };
    } else {
      return { Message: "Error", Error: "data not found" };
    }
  } catch (error) {
    console.error(error);
    return { Message: "Error", data: "unable to update your data" };
  }
};
let getMultipleItemsTransaction = async (body, query) => {
  try {
    let { toDate, fromDate, selectSearches, productName, token, businessId } =
      query;

    let selectData = `select * from dailyTransaction where registeredTimeDaily BETWEEN '${DateFormatter(
      fromDate
    )}' and '${DateFormatter(toDate)}' and businessId='${businessId}'`;
    let [results] = await pool.query(selectData);
    return { data: results };
  } catch (error) {
    console.log("error", error);
    return { data: "error 113" };
  }
};
let getBusinessTransactions = async (body, query) => {
  let { BusinessID } = query.business;
  let selcetEachInfo = `select * from dailyTransaction where businessId='${BusinessID}'`;
  let [eachResult] = await pool.query(selcetEachInfo);
  return { data: eachResult };
};
module.exports = {
  getBusinessTransactions,
  getMultipleItemsTransaction,
  updateDailyTransactions,
  registerSinglesalesTransaction,
  getDailyTransaction,
  deleteTransactions,
};
