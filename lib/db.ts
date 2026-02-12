import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "0valedge!",
  database: process.env.DB_NAME || "hostelhub",
});

export default pool;