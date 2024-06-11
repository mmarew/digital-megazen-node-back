const { v4: uuidv4 } = require("uuid");
let bcript = require("bcryptjs");
const { pool, executeQuery } = require("./Config/db.config");
const JWT = require("jsonwebtoken");
require("dotenv").config();

try {
} catch (error) {}

let createBasicTables = async () => {
  try {
    const createTableCashOnhand = `create table if not exists CashOnHand(
      cashOnHandId int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY, 
      cashOnHandAmount float(11) NOT NULL, 
      cashOnHandStatus enum('active','inactive'),
      businessId int NOT NULL , foreign key (businessId) references Business(BusinessID)
    )`;

    let [createTableCashOnhandQuery] = await pool.query(createTableCashOnhand);
    // it is record of phone and secret key to send pin code to user, every user should not send pincode to reset passwords , but limitted phones should do it.
    // secret_key,phone_number
    let createPasswordRecoveryPhones = `CREATE TABLE if not exists password_recovery_Phones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phone_number VARCHAR(400) NOT NULL,
  secret_key VARCHAR(400) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`;
    let [createPasswordRecoveryPhonesQuery] = await pool.query(
      createPasswordRecoveryPhones
    );
    // clientSideUniqueId is used to identify users action in server side, if user try to reregister same data , then it will throw error which says user is already registered
    let createTableBank = `create table if not exists bankDeposits(
      bankDepositsId int(11) NOT NULL AUTO_INCREMENT, 
         clientSideUniqueId varchar(100) NOT NULL, depositedAmount float(11) NOT NULL,depositedDate date, depositedBy int, businessId int, 
         accountNumber varchar (20), 
         depositsDescriptions varchar(900),
  attachedFilesName varchar(300) default 'No file',
PRIMARY KEY (bankDepositsId),FOREIGN KEY (businessId) REFERENCES Business(BusinessID)
    )`;
    let [depositQuery] = await pool.query(createTableBank);
    // paierId is the man who pay debt money to the owner of credit, my be owner or employee, so it is userId in users table
    // filesName is any file like recite, payment agreement or other document which can verify payment transaction to debt
    let debtPaymentSql = `create table if not exists debtPayment(
      paymentId int not null auto_increment,
      dailySalesId int not null,
       paidDate DATE,
     paidAmount int not null,
      paierId int not null ,
       businessId int not null,
       productId int not null,
        Descriptions varchar (3000), 
        paymentType enum('On cash', 'By bank'), 
        attachedDebtPaymbentFilesName varchar (300), 
         PRIMARY KEY (paymentId)
        )`;
    // @smart#Megaazen$
    let [debtQuery] = await pool.query(debtPaymentSql);
    let createCreditCollection = `CREATE TABLE IF NOT EXISTS creditCollection (
    collectionId INT NOT NULL auto_increment,
    collectionDate DATE,
    userId int,
    collectionAmount float,
    registrationSource enum('total','Single'),
    businessId INT,
    targtedProductId INT,
    transactionId INT,
    collectionAttachedFiles varchar(300) default 'No file',
    collectedBy varchar(3000),
    descriptions varchar (3000),
    PRIMARY KEY (collectionId)
)`;

    let [responses] = await pool.query(createCreditCollection);

    let createTableDailyTransaction = `create table if not exists dailyTransaction(dailySalesId int auto_increment,
      registeredBy int not null,
       mainProductId int, 
       purchaseQty float not null default 0,
       debtDueDate date default null,
       purchasePaymentType enum ('On cash', 'On debt', 'By bank', 'Free gift'),
      debtStatus ENUM('initial', 'partially paid', 'fully paid') DEFAULT 'initial',

        unitPrice float not null default 0, 
         unitCost float not null default 0, 
        salesQty float not null default 0 ,
         creditsalesQty float not null default 0, 
         salesTypeValues enum('On cash','By bank','On credit','Credit paied','Partially paied'),
         creditPaymentDate date,
          partiallyPaidInfo JSON,
           businessId int, 
           ProductId int, 
           brokenQty float, Description varchar(2000),
            registeredTimeDaily Date,
            itemDetailInfo varchar(9000), 
            attachedFilesName varchar(4000),
            inventoryItem float not null, 
            primary key(dailySalesId))`;
    pool
      .query(createTableDailyTransaction)
      .then((data) => {})
      .catch((error) => {});

    let create = `create table if not exists employeeTable(employeeId int auto_increment, hiredDate DATETIME, userIdInEmployee int,BusinessIDEmployee int, employerId int, employeeRole varchar(300) not null default '[]', primary key(employeeId))`;
    pool
      .query(create)
      .then(() => {})
      .catch(() => {});
    // Business table
    let creeateBusiness = `create table if not exists Business (BusinessID int auto_increment, BusinessName varchar(500), uniqueBusinessName varchar(900) not null, createdDate DATETIME, ownerId int, status varchar(300), primary key(businessId))`;

    pool.query(creeateBusiness).then().catch();
    let queryTocreateUsersTable = `create table if not exists usersTable(userId int auto_increment, uniqueId varchar(37) not null, userName varchar(600), phoneNumber varchar(200),employeeName varchar(600) not null,primary key(userId))`;

    /////////////////////////////////
    let userCredential = `create table if not exists userCredential(credentialId int auto_increment, userId int not null, uniqueId varchar(90) not null, password varchar(200) not null,passwordStatus varchar(90),  passwordResetPin int default 0, primary key(credentialId))`;
    pool.query(userCredential).then().catch();
    pool
      .query(queryTocreateUsersTable)
      .then((data) => {})
      .catch((error) => {});
  } catch (error) {
    console.log(error);
    console.log("error error error error==== ", error);
  }
};

const createBusiness = async ({
  businessName,
  ownerId,
  createdDate,
  source,
}) => {
  try {
    const cleanBusinessName = businessName.replace(/[^A-Za-z0-9_]/g, "");
    let newBusinessName = cleanBusinessName;

    const selectQuery = `SELECT * FROM Business WHERE uniqueBusinessName = ?`;
    const insertQuery = `INSERT INTO Business (businessName, uniqueBusinessName, ownerId, createdDate) VALUES (?, ?, ?, ?)`;

    const registerMainBusinessName = async (nameOfBusiness) => {
      try {
        const [rows] = await pool.query(selectQuery, [nameOfBusiness]);
        if (rows.length === 0) {
          await pool.query(insertQuery, [
            businessName,
            nameOfBusiness,
            ownerId,
            createdDate,
          ]);
          return { Message: "Success", data: "Business Created" };
        } else {
          const { BusinessID } = rows[0];
          newBusinessName = cleanBusinessName + "_" + BusinessID;
          return await registerMainBusinessName(newBusinessName);
        }
      } catch (error) {
        console.log(error);
        return { Message: "Error", Error: "error on creating business" };
      }
    };

    await registerMainBusinessName(newBusinessName);

    const tableNames = ["_expenses", "_Costs", "_products", "_Transaction"];
    const createTableQueries = [
      `CREATE TABLE IF NOT EXISTS ?? (expenseId INT(11) NOT NULL AUTO_INCREMENT, costId INT(11) NOT NULL, registeredBy int,  costAmount float(11) NOT NULL, costDescription VARCHAR(9000) NOT NULL, costRegisteredDate DATE NOT NULL, status enum('active','deleted','updated') default 'active',deletedAt Date,deletedBy int, attachedFilesName VARCHAR(1000), PRIMARY KEY (expenseId))`,
      `CREATE TABLE IF NOT EXISTS ?? (costsId INT(11) NOT NULL AUTO_INCREMENT, costName VARCHAR(3000) NOT NULL, registeredBy int, expItemRegistrationDate Date, unitCost float(11) NOT NULL, attachedExpItemFiles VARCHAR(1000), status enum('active','deleted','updated') default 'active',deletedAt Date,deletedBy int,  PRIMARY KEY (costsId))`,
      `CREATE TABLE IF NOT EXISTS ?? (ProductId INT(11) NOT NULL AUTO_INCREMENT, productRegistrationDate date, registeredBy int, mainProductId int, productsUnitCost float(11) NOT NULL, prevUnitCost float, productsUnitPrice float(11) NOT NULL, prevUnitPrice float, productName VARCHAR(900) NOT NULL, prevProductName varchar(1000), minimumQty float(11) NOT NULL, prevMinimumQty float, Status enum('active','changed','replaced','active_but_updated','deleted','updated') default 'active', 
      changedBy int,changedAt date, PRIMARY KEY (ProductId))`,
      `CREATE TABLE IF NOT EXISTS ?? (transactionId INT(11) NOT NULL AUTO_INCREMENT, unitCost INT(11) NOT NULL, registeredBy int, unitPrice float(11) NOT NULL, productIDTransaction INT(11) NOT NULL, mainProductId int, salesQty float(11) NOT NULL default 0, creditsalesQty float(11) NOT NULL default 0, purchaseQty float(11) NOT NULL default 0, wrickages INT(11) NOT NULL default 0, Inventory float(11) NOT NULL default 0, description VARCHAR(5000) NOT NULL, registeredTime DATE NOT NULL, creditDueDate date, salesTypeValues enum(  'On cash','By bank','On credit','Credit paied','Partially paid'), registrationSource enum('Total','Single'), partiallyPaidInfo JSON, creditPayementdate date, PRIMARY KEY (transactionId))`,
    ];

    const tableCollections = {};

    for (let i = 0; i < createTableQueries.length; i++) {
      const query = createTableQueries[i];
      const tableName = newBusinessName + tableNames[i];
      const [result] = await pool.query(query, [tableName]);
      tableCollections[query] = result.rowCount;
    }
    return {
      Message: "Success",
      data: "Business created successfully",
    };
  } catch (error) {
    return { Message: "Error", Error: "Unable to create business" };
  }
};

const insertIntoUserTable = async ({
  fullName,
  registerPhone,
  registerPassword,
}) => {
  try {
    const checkQuery = `SELECT * FROM usersTable WHERE phoneNumber = ?`;
    const [rows] = await pool.query(checkQuery, [registerPhone]);

    if (rows.length > 0) {
      return {
        Error: "This phone number is registered before.",
        Message: "Error",
      };
    } else {
      const uniqueId = uuidv4(); // Generates a version 4 UUID
      console.log(uniqueId);
      const salt = bcript.genSaltSync();
      const encryptedPassword = bcript.hashSync(registerPassword, salt);
      const insertQuery = `INSERT INTO usersTable (uniqueId ,employeeName, phoneNumber) VALUES (?,?, ?)`;
      const [result] = await pool.query(insertQuery, [
        uniqueId,
        fullName,
        registerPhone,
        encryptedPassword,
      ]);
      if (result.affectedRows <= 0) {
        return {
          Message: "Error",
          Error: "Data is not inserted successfully.",
        };
      }

      const insertedId = result.insertId;
      const tokenKey = process.env.tokenKey;
      const token = JWT.sign({ userID: insertedId }, tokenKey);
      // insert into userCredential table
      let sqlToInsertToCredentials = `INSERT INTO userCredential (userId, uniqueId, password) VALUES (?, ?, ?)`;
      let [rows] = await pool.query(sqlToInsertToCredentials, [
        insertedId,
        uniqueId,
        encryptedPassword,
      ]);

      if (rows.affectedRows > 0) {
        return {
          Message: "Success",
          data: "Data is inserted successfully.",
          token,
        };
      }
      return {
        Message: "Error",
        Error: "Data is not inserted successfully.",
      };
    }
  } catch (error) {
    console.log("first error", error);
    return { error: "An error occurred.", Message: "Error" };
  }
};

const deleteBusiness = async (body) => {
  try {
    let { businessName, businessId } = body;
    let sqlToGetBusiness = `select * from Business where BusinessID=?`;
    let businessRows = await executeQuery(sqlToGetBusiness, [businessId]);
    if (businessRows.length === 0) {
      return { data: "business not found" };
    }

    let uniqueBusinessName = businessRows[0]?.uniqueBusinessName;
    if (!uniqueBusinessName) {
      return { data: "business not found" };
    }
    let sql = `DELETE FROM Business WHERE BusinessID=?`;
    let tables = ["_expenses", "_Costs", "_Transaction", "_products"];
    let tableLength = tables.length;
    let i = 0;
    let sqlValues = [businessId];
    // delete all bank deposites
    let sqlToDeleteDeposit = `DELETE FROM bankDeposits WHERE businessId=?`;
    let [deleteResults] = await pool.query(sqlToDeleteDeposit, [businessId]);
    console.log("deleteResults", deleteResults);
    const deleteEachTable = async () => {
      let drop = `DROP TABLE IF EXISTS ??`;
      let dropvalues = [uniqueBusinessName + tables[i]];

      try {
        await pool.query(drop, dropvalues);

        if (i === tableLength - 1) {
          const result = await pool.query(sql, sqlValues);
          return { data: "delete success" };
        } else if (i < tableLength - 1) {
          i++;
          return deleteEachTable(); // Return the promise to properly handle the async flow
        }
      } catch (error) {
        console.log("error", error);
        return {
          message: "error",
          error: `error in deleting business`,
        };
      }
    };

    return deleteEachTable(); // Return the promise to properly handle the async flow
  } catch (error) {
    return { data: "error", error: "error no d1" };
  }
};
let updateTables = async () => {
  return;
  let sqlToSelect = `SELECT * FROM Business`;
  let [rows] = await pool.query(sqlToSelect);
  try {
    // attachedExpItemFiles,attachedFilesName,_Costs
    if (rows.length > 0) {
      rows.map(async (row, i) => {
        try {
          // console.log("rows", rows[i]);
          let uniqueBusinessName = rows[i]?.uniqueBusinessName;
          let _Costs = uniqueBusinessName + "_Costs";
          console.log("_Costs", _Costs);
          let sqlToAlterTableColumn = `ALTER TABLE ${_Costs} ADD COLUMN if not exists status ENUM('active', 'deleted', 'updated') DEFAULT 'active'`;
          let [results] = await pool.query(sqlToAlterTableColumn);
          console.log("results", results);
        } catch (error) {
          console.log("first error", error);
        }
      });
    }
  } catch (error) {
    console.log("error", error.message);
  }
};

module.exports = {
  deleteBusiness,
  insertIntoUserTable,
  createBusiness,
  createBasicTables,
  updateTables,
};
