const addCashOnHand = async ({ businessId, amount }) => {
  try {
    let sqlTogetCashOnHand = `select cashOnHandAmount from CashOnHand where businessId='${businessId}'`;

    let [result] = await pool.query(sqlTogetCashOnHand);

    if (result.length > 0) {
      let { cashOnHandAmount } = result[0];
      let newAmount = cashOnHandAmount + amount;
      const updateSql = `update CashOnHand set cashOnHand=${newAmount} where businessId='${businessId}'`;
      await pool.query(updateSql);

      return { Message: "Success", CashOnHand: newAmount };
    } else {
      const insertSql = `insert into CashOnHand(businessId,cashOnHand) values('${businessId}',${amount})`;
      await pool.query(insertSql);

      return { Message: "Success", CashOnHand: amount };
    }
  } catch (error) {
    console.log("error", error);
    return { Message: "Error", Error: error.message };
  }
};
const deductCashOnHand = async ({ businessId, amount }) => {
  try {
    let sqlTogetCashOnHand = `select cashOnHandAmount from CashOnHand where businessId='${businessId}'`;
    let [result] = await pool.query(sqlTogetCashOnHand);
    if (result.length > 0) {
      let { cashOnHandAmount } = result[0];
      let newAmount = cashOnHandAmount - amount;
      const updateSql = `update CashOnHand set cashOnHand=${newAmount} where businessId='${businessId}'`;
      await pool.query(updateSql);
      return { Message: "Success", CashOnHand: newAmount };
    } else {
      return { Message: "Error", Error: "Cash on hand not found" };
    }
  } catch (error) {
    console.log("error", error);
    return { Message: "Error", Error: error.message };
  }
};

module.exports.addCashOnHand = addCashOnHand;
module.exports.deductCashOnHand = deductCashOnHand;
