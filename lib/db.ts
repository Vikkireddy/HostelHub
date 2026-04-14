import mysql from "mysql2/promise";

const dbPort = Number.parseInt(process.env.DB_PORT || "3306", 10);

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number.isFinite(dbPort) ? dbPort : 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "0valedge!",
  database: process.env.DB_NAME || "hostelhub",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
});

export default pool;