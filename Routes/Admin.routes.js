const express = require("express");
const { pool } = require("../Config/db.config");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { authMiddleware } = require("../middleware/Auth");
router.get("/admin__getUsers", async (req, res) => {
  let allusers = `select * from usersTable`;
  let [users] = await pool.query(allusers);

  res.json({ data: users });
});
router.get("/get__businesses", async (req, res) => {
  try {
    let get__businesses = `select * from Business, usersTable where userId=ownerId`;
    let [Result1] = await pool.query(get__businesses);
    res.json({ data: Result1 });
  } catch (error) {
    console.log("error", error);
  }
});
router.get(
  "/registerPhoneNumberAndSecretKey",
  authMiddleware,
  async (req, res) => {
    // let { phoneNumber, secretKey } = req.query;

    let plainPhoneNumber = "ytnbvgffgfg.jjkjkhjg.hjhjhjh",
      plainSecretkey = "hghh ghgh gh h hhhg hghgyfiytrtygfgjhch";

    let insert = `INSERT INTO password_recovery_Phones (secret_key, phone_number) VALUES (?, ?)`;

    const salt = bcrypt.genSaltSync();

    // const Encripted = bcript.hashSync(newPassword, salt);
    let hashedKey = bcrypt.hashSync(plainSecretkey, salt);
    let hashedPhoneNumber = bcrypt.hashSync(plainPhoneNumber, salt);

    let [Result] = await pool.query(insert, [hashedKey, hashedPhoneNumber]);
    console.log("Result", Result);
    if (Result.affectedRows > 0) console.log(" registered successfully");
    else console.log("unable to register");
    res.json({ data: Result });
  }
);

module.exports = router;
