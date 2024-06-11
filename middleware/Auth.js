require("dotenv").config();
const jwt = require("jsonwebtoken");
const { pool, executeQuery } = require("../Config/db.config");
const bcrypt = require("bcryptjs");
const { body } = require("express-validator");

let authMiddleware = (req, res, next) => {
  let tokenString = req.body.token;
  if (!tokenString) tokenString = req.query.token;
  if (!tokenString) tokenString = req.headers["x-access-token"];
  if (!tokenString) tokenString = req.params.token;
  if (!tokenString) tokenString = req.headers.authorization;
  // console.log("tokenString=====", tokenString);
  if (!tokenString) {
    return res.status(401).json({ error: "No token provided." });
  }
  try {
    // Assuming 'datas' contains the token
    const token = jwt.verify(tokenString, process.env.tokenKey);

    // Attach the user ID to the request for future middleware or route handlers
    req.userID = token.userID;
    req.body.userID = token.userID;
    // Call the next middleware or route handler
    return next();
  } catch (error) {
    console.error("Error verifying token in Auth.js", error);
    // If token verification fails, you might want to send an error response
    return res.status(401).json({ error: "Unauthorized" });
  }
};

let authMiddleware2 = async (req, res, next) => {
  try {
    const { userPassword, userID } = req.body;
    // Use parameterized queries to prevent SQL injection
    const select = "SELECT * FROM  userCredential WHERE userId = ? LIMIT 1";
    const rows = await executeQuery(select, [userID]);
    if (rows.length === 0) {
      // Use res.status().json() for consistent response
      return res.status(401).json({ error: "User not found." });
    }

    const savedPassword = rows[0].password;
    const isMatch = bcrypt.compareSync(userPassword, savedPassword);
    if (isMatch) {
      // Attach user information to the request for future middleware or route handlers
      req.userData = {
        userID: rows[0].userId,
        username: rows[0].username,
        // Add more user-related information if needed
      };
      return next();
    } else {
      // Use res.status().json() for consistent response
      return res.status(401).json({ data: "wrong Password." });
    }
  } catch (error) {
    // Log the error for debugging purposes
    console.error(error);
    // Use res.status().json() for consistent response
    return res.status(500).json({ error: "Internal server error." });
  }
};
let isAdmin = async (req, re) => {
  try {
    let { userID, businessId } = req.body;
    // for get methodes
    if (!businessId) {
      businessId = req.query.businessId;
    }
    // for get methodes
    if (!businessId) {
      businessId = req.params.businessId;
    }

    if (!businessId || !userID) {
      return res.status(401).json({ error: "User not found." });
    }
    // sql to verify if user is admin or owner
    let sqlToGetBusiness = `select * from Business where BusinessID=? and ownerId=?`;
    let [businessRows] = await pool.query(sqlToGetBusiness, [
      businessId,
      userID,
    ]);
    return businessRows;
  } catch (error) {
    console.log("Error on isAdmin", error);
    return "Error";
  }
};
let isEmployee = async (req) => {
  try {
    let { userID, businessId } = req.body;
    // for get methodes
    if (!businessId) {
      businessId = req.query.businessId;
    }
    // for get methodes
    if (!businessId) {
      businessId = req.params.businessId;
    }

    let sqlToGetEmployee = `select * from employeeTable where userIdInEmployee=? and BusinessIDEmployee=?`;
    let [employeeRows] = await pool.query(sqlToGetEmployee, [
      userID,
      businessId,
    ]);
    return employeeRows;
  } catch (error) {
    console.log("Errors on isEmployee", error);
    return "Error";
  }
};
let authMiddlewareIsAdmin = async (req, res, next) => {
  let businessRows = await isAdmin(req, res);
  if (businessRows == "Error") {
    // Use res.status().json() for consistent response
    return res.status(401).json({ error: "User not found." });
  }
  if (businessRows.length === 0) {
    // Use res.status().json() for consistent response
    return res.status(401).json({ error: "User not found." });
  } else {
    next();
  }
};
let authMiddlewareIsEmployee = async (req, res, next) => {
  let employeeRows = await isEmployee(req.body);
  if (employeeRows == "Error") {
    // Use res.status().json() for consistent response
    return res.status(401).json({ error: "User not found." });
  }
  if (employeeRows.length === 0) {
    // Use res.status().json() for consistent response
    return res.status(401).json({ error: "User not found." });
  } else {
    next();
  }
};
let authMiddlewareIsAdminOrEmployee = async (req, res, next) => {
  try {
    // console.log("req.body", req.body);
    // return;
    let businessRows = await isAdmin(req, res);
    if (businessRows == "Error") {
      return res.status(401).json({ error: "User not found." });
    }
    if (businessRows.length === 0) {
      // sql to verify if user is employee
      let employeeRows = await isEmployee(req);
      if (employeeRows == "Error") {
        // Use res.status().json() for consistent response
        return res.status(401).json({ error: "User not found." });
      }
      // return;
      if (employeeRows.length === 0) {
        // Use res.status().json() for consistent response
        return res.status(401).json({ error: "You are not employee." });
      } else {
        next();
      }
    } else {
      next();
    }
  } catch (error) {
    // Log the error for debugging purposes
    console.error(error);
    // Use res.status().json() for consistent response
    return res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = {
  authMiddleware,
  authMiddleware2,
  authMiddlewareIsAdminOrEmployee,
  authMiddlewareIsAdmin,
  authMiddlewareIsEmployee,
};
