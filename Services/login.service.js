const { pool } = require("../Config/db.config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenKey = process.env.tokenKey;
let login = async (phoneNumber, password) => {
  try {
    if (!phoneNumber) {
      return { Message: "Error", Error: "you did not provide phone number" };
    }
    if (!password) {
      return { Message: "Error", Error: "no password provided" };
    }
    let select = `SELECT * FROM usersTable  WHERE phoneNumber = ?`;
    let [rows] = await pool.query(select, [phoneNumber]);
    if (rows.length == 0) {
      return { Message: "Error", Error: "Not Registered Phone Number" };
    }
    let uniqueId = rows[0].uniqueId;
    let sqlToVerifyPassword = `SELECT * FROM userCredential WHERE uniqueId = ?`;
    let [credentialsRow] = await pool.query(sqlToVerifyPassword, [uniqueId]);
    console.log("credentialsRow", credentialsRow);
    // return;
    let savedPassword = credentialsRow[0].password;
    let { employeeName } = rows[0];
    const isMatch = bcrypt.compareSync(password, savedPassword);
    // return;
    if (isMatch) {
      let token = jwt.sign(
        { userID: rows[0].userId, usersFullName: employeeName },
        tokenKey
      );
      return { Message: "Success", data: "login successfully.", token };
    } else {
      return { Message: "Error", Error: "wrong password." };
    }
  } catch (error) {
    console.log("error", error);
    return { Message: "Error", Error: "error in login service" };
  }
};
// server.post(path + "verifyLogin/",

const verifyLogin = async (body) => {
  console.log("body", body);
  // return;
  try {
    const userID = body.userID;
    const selectQuery = `SELECT * FROM usersTable WHERE userId = ?`;

    const [rows] = await pool.query(selectQuery, [userID]);
    console.log("rows", rows);

    if (rows.length > 0) {
      let { employeeName } = rows[0];
      let token = jwt.sign(
        { userID: rows[0].userId, usersFullName: employeeName },
        tokenKey
      );
      return { data: "alreadyConnected", token, result: rows };
    } else {
      return { data: "dataNotFound" };
    }
  } catch (err) {
    console.error(err);
    return { error: "Internal Server Error" };
  }
};
const requestPasswordReset = async (body) => {
  try {
    const select = `update    usersTable WHERE passwordStatus = 'requestedToReset'`;
    const [rows] = await pool.query(select);

    if (rows.length > 0) {
      const userId = rows[0].userId;
      const update = `UPDATE usersTable SET passwordStatus = 'pinSentedToUser' WHERE userId = ?`;
      await pool.query(update, [userId]);

      const phoneNumber = rows[0].phoneNumber;
      const pinCode = rows[0].passwordResetPin;
      return { phoneNumber, pinCode };
    } else {
      return { phoneNumber: "notFound", pinCode: "notFound" };
    }
  } catch (error) {
    console.error(error);
    return { error: "Internal Server Error" };
  }
};
const verifyPin = async (body) => {
  try {
    const phone = body.phoneNumber;
    const pincode = body.pincode;
    const forgetUniqueId = body.forgetUniqueId;

    if (!phone || !pincode) {
      return { error: "phone number or pincode not found" };
    }
    const select = `SELECT * FROM userCredential WHERE uniqueId='${forgetUniqueId}' and passwordResetPin = '${pincode}'`;
    const [rows] = await pool.query(select);
    console.log("rows", rows);
    // return;
    if (rows.length > 0) {
      const pin = rows[0].passwordResetPin;
      if (pincode == pin) {
        return { Message: "Success", data: "correctPin" };
      } else {
        return { Message: "Error", Error: "wrongPin" };
      }
    } else {
      return { Message: "Error", Error: "Wrong pin code" };
    }
  } catch (error) {
    console.error(error);
    return { Message: "Success", Error: "Internal Server Error" };
  }
};
const forgetRequest = async (body) => {
  try {
    const phoneNumber = body.phoneNumber;
    console.log("phoneNumber", phoneNumber);
    const sql = `SELECT * FROM usersTable where phoneNumber = ?`;
    const [rows] = await pool.query(sql, [phoneNumber]);

    if (rows.length > 0) {
      let { uniqueId } = rows[0];
      let verfyCredential = `select * from userCredential where uniqueId=?`;
      let [credentialResponces] = await pool.query(verfyCredential, [uniqueId]);
      if (credentialResponces.length == 0) {
        return { Message: "Error", Error: "wrong credential" };
      }
      // console.log("credentialResponces", credentialResponces);
      const sixDigit = Math.floor(Math.random() * 1000000);
      const updateForgetPassStatus = `UPDATE userCredential SET passwordStatus =?, passwordResetPin = ? WHERE uniqueId = ?`;

      let [updateResult] = await pool.query(updateForgetPassStatus, [
        "requestedToReset",
        sixDigit,
        uniqueId,
      ]);
      if (updateResult.affectedRows > 0)
        return {
          Message: "Success",
          data: "requestedToChangePassword",
          uniqueId,
        };
      return {
        Message: "Error",
        Error: "something went wrong to request password changes",
      };
    } else {
      return { Message: "Error", Error: "Phone number not found" };
    }
  } catch (error) {
    console.error(error);
    return { error: "Internal Server Error" };
  }
};
const updateChangeInpassword = async (body) => {
  console.log("body", body);
  // return;
  try {
    let phoneNumber = body.phoneNumber;
    let password = body.password.password;
    let retypedPassword = body.password.retypedPassword;
    let forgetUniqueId = body.forgetUniqueId;

    if (password !== retypedPassword) {
      return { error: "Passwords do not match" };
    }
    const salt = bcrypt.genSaltSync();
    const encryptedPassword = bcrypt.hashSync(password, salt);

    let update = `UPDATE userCredential SET password = ? WHERE uniqueId = ?`;
    let [result] = await pool.query(update, [
      encryptedPassword,
      forgetUniqueId,
    ]);
    console.log("result userCredential==== ", result);
    if (result.affectedRows > 0) {
      return { Message: "Success", data: "passwordChanged" };
    } else {
      return { Message: "Error", Error: "unableToMakeChange" };
    }
  } catch (error) {
    console.log("error");
    return { Message: "Error", Error: "unableToMakeChange" };
  }
};
let verifyPhoneNumberOfPinSender = async ({
  plainSecretkey,
  plainPhoneNumber,
}) => {
  try {
    let selectSecretCode = `SELECT secret_key, phone_number FROM password_recovery_Phones `;
    let [rowsOfPhones] = await pool.query(selectSecretCode);
    console.log("rowsOfPhones", rowsOfPhones);
    if (rowsOfPhones.length == 0)
      return {
        Message: "Error",
        Error: "No phone number found to respond pin code",
      };

    for (const row of rowsOfPhones) {
      const { secret_key, phone_number } = row;

      const isMatchKey = bcrypt.compareSync(plainSecretkey, secret_key);
      const isMatchPhone = bcrypt.compareSync(plainPhoneNumber, phone_number);

      if (isMatchPhone && isMatchKey) {
        return {
          Message: "Success",
        };
      }
    }

    return {
      Message: "Error",
      Error:
        "wrong phone or secret key, please enter correct phone number and secret key",
    };
  } catch (error) {
    console.log("  error", error);
    return { Message: "Error", Error: "Internal Server Error" };
  }
};
let getPasswordResetPin = async () => {
  try {
    let selectPasswordRequest = `SELECT * FROM usersTable,userCredential WHERE userCredential.passwordStatus='requestedToReset' and userCredential.userId=usersTable.userId  limit 20`;
    let [rows] = await pool.query(selectPasswordRequest);
    if (rows.length <= 0) {
      return [{ pinCode: "notFound", phoneNumber: "notFound" }];
    }
    let Collections = [];
    rows.map(async (row) => {
      let { passwordResetPin, phoneNumber, uniqueId } = row;
      Collections.push({ phoneNumber: phoneNumber, pinCode: passwordResetPin });
      let update = `UPDATE userCredential SET passwordStatus = 'pinSentedToUser' WHERE uniqueId = ?`;
      await pool.query(update, [uniqueId]);

      //phoneNumber,pinCode
      // return { pinCode: passwordResetPin, phoneNumber: phoneNumber };
    });
    return Collections;
  } catch (error) {
    console.log("error", error);

    return "error";
  }
};

module.exports = {
  getPasswordResetPin,
  updateChangeInpassword,
  login,
  verifyLogin,
  requestPasswordReset,
  verifyPin,
  forgetRequest,
  verifyPhoneNumberOfPinSender,
};
