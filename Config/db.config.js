const mysql2 = require("mysql2/promise");
require("dotenv").config();

let pool = mysql2.createPool({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
  connectTimeout: 30000, // 30 seconds
  waitForConnections: true, // Whether the pool should queue the connection requests when no connections are available
  connectionLimit: 11, // Adjust the connection limit based on your application needs
});

const executeQuery = async (query, values) => {
  let connection;
  try {
    connection = await pool.getConnection(); // Get a connection from the pool
    const [rows] = await connection.execute(query, values);
    return rows;
  } catch (error) {
    return null;
  } finally {
    if (connection) {
      connection.release(); // Always release the connection back to the pool
    }
  }
};

module.exports = { pool, executeQuery };
