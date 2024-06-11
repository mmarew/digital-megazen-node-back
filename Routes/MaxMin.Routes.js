const { pool } = require("../Config/db.config");
const { getUniqueBusinessName } = require("../Utility/UniqueBusinessName");
const { authMiddleware } = require("../middleware/Auth");
let path = "/";

const Router = require("express").Router();
Router.post(path + "getMaximumSales/", authMiddleware, async (req, res) => {
  let { userID, businessName, DateRange, businessId } = req.body;
  let { toDate, fromDate } = DateRange;
  let uniqueBusinessName = await getUniqueBusinessName(businessId, userID);
  if (uniqueBusinessName == `you are not owner of this business`) {
    return res.json({ data: uniqueBusinessName });
  }
  businessName = uniqueBusinessName;
  // let select = `select * from ${businessName}_products, ${businessName}_Transaction where  ProductId = productIDTransaction and  registrationDate  between '${toDate}' and '${fromDate}'`;
  const tableProduct = `${businessName}_products`;
  const tableTransaction = `dailyTransaction`;

  const select = `SELECT *
                FROM ?? as P, ?? AS T
                WHERE P.ProductId = T.ProductId and T.businessId = '${businessId}'    AND  T.registeredTimeDaily  BETWEEN ? AND ?`;

  const values = [tableProduct, tableTransaction, fromDate, toDate];

  pool
    .query(select, values)
    .then(([rows]) => {
      if (rows) {
        return res.json({ data: rows, values });
      }
    })
    .catch((error) => {
      console.log(error);
      res.json({ data: error });
    });
});
Router.post(path + "GetMinimumQty/", authMiddleware, async (req, res) => {
  try {
    const { businessId, userID } = req.body;
    let uniqueBusinessName = await getUniqueBusinessName(businessId, userID);

    if (uniqueBusinessName === "you are not owner of this business") {
      return res.json({ data: uniqueBusinessName });
    }

    const table = `${uniqueBusinessName}_`;
    const inventoryList = [];
    let getProducts = `SELECT * FROM ${table}products where Status='active' || Status IS NULL`;
    // select * from ?? where Status='active' || Status IS NULL

    const [ProductResults] = await pool.query(getProducts);

    if (ProductResults.length === 0) {
      return res.json({ data: inventoryList });
    } else if (ProductResults.length > 0) {
      // Using Promise.all to wait for all asynchronous operations to complete
      await Promise.all(
        ProductResults.map(async (item, index) => {
          let { mainProductId, ProductId } = item;
          console.log("mainProductId", mainProductId, "ProductId", ProductId);
          // return;
          if (!mainProductId) {
            let sqlToSelect = `SELECT * FROM ${table}products AS P, dailyTransaction AS T WHERE  (P.mainProductId IS NULL AND P.ProductId = T.ProductId)  and T.businessId = '${businessId}' and P.Status='active' || P.Status IS NULL ORDER BY T.registeredTimeDaily desc, T.dailySalesId desc  limit 1`;
            let [eachInventory1] = await pool.query(sqlToSelect);
            console.log("eachInventory1", eachInventory1);
            if (eachInventory1.length === 0) {
              return inventoryList.push({ ...item });
            }
            return inventoryList.push({ ...eachInventory1[0] });
          }
          // console.log(mainProductId);
          let queryToselectInventory = `SELECT * FROM ${table}products AS P, dailyTransaction AS T WHERE ((P.mainProductId = T.mainProductId AND P.mainProductId = '${mainProductId}') ) and T.businessId = '${businessId}' and P.Status='active' || P.Status IS NULL ORDER BY T.registeredTimeDaily desc, T.dailySalesId desc  limit 1`;
          let [eachInventory] = await pool.query(queryToselectInventory);

          if (eachInventory.length === 0) {
            inventoryList.push({ ...item });
          } else {
            inventoryList.push({ ...eachInventory[0] });
          }
        })
      );

      return res.json({ data: inventoryList });
    }
  } catch (error) {
    console.log("error", error);
  }
});

module.exports = Router;
