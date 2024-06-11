let bcript = require("bcryptjs");

const { pool } = require("../Config/db.config");
const {
  RegisterUsersController,
  getMyProfile,
  deleteUsers,
} = require("../Controllers/Users.Controller");
const { authMiddleware, authMiddleware2 } = require("../middleware/Auth");
let Router = require("express").Router();
const path = "/";
Router.post(
  path + "deleteUsers/",
  authMiddleware,
  authMiddleware2,
  deleteUsers
);

Router.post(path + "RegisterUsers/", RegisterUsersController);

Router.post(path + "getMyProfile/", authMiddleware, getMyProfile);

Router.post(
  path + "updateUsers",
  authMiddleware,
  authMiddleware2,
  async (req, res) => {
    try {
      // return;
      let { fullName, phoneNumber, oldPassword, newPassword, userID } =
        req.body;
      let query, values;
      const salt = bcript.genSaltSync();

      const Encripted = bcript.hashSync(newPassword, salt);

      if (newPassword === "noChangeOnPassword") {
        query = `
          UPDATE usersTable
          SET phoneNumber = ?,
              employeeName = ?
          WHERE userId = ?
        `;
        values = [phoneNumber, fullName, userID];
      } else {
        query = `
          UPDATE usersTable
          SET phoneNumber = ?,
              employeeName = ?,
              password = ?
          WHERE userId = ?
        `;
        values = [phoneNumber, fullName, Encripted, userID];
      }

      const result = await pool.query(query, values);

      if (result.affectedRows === 0) {
        return res.json({ data: "error 06.1" });
      }

      res.json({ data: "your data is updated" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ data: "error 06.1" });
    }
  }
);

module.exports = Router;
