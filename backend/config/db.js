import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const connectionUrl =
  process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.DB_URL;

let parsedConnectionUrl;
if (connectionUrl) {
  try {
    parsedConnectionUrl = new URL(connectionUrl);
  } catch (err) {
    console.warn("⚠️ Invalid DATABASE_URL/MYSQL_URL/DB_URL format.", err.message);
  }
}

const isSslEnabled = ["true", "1", "yes"].includes(
  String(process.env.DB_SSL || "").toLowerCase(),
);
const isProduction = String(process.env.NODE_ENV || "").toLowerCase() === "production";
const hasLocalConfig = !isProduction && Boolean(
  process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME,
);
const useUrlConfig = !hasLocalConfig && Boolean(parsedConnectionUrl);

const dbConfig = {
  host: useUrlConfig
    ? parsedConnectionUrl.hostname
    : process.env.DB_HOST || "127.0.0.1",
  user: useUrlConfig
    ? decodeURIComponent(parsedConnectionUrl.username)
    : process.env.DB_USER,
  password: useUrlConfig
    ? decodeURIComponent(parsedConnectionUrl.password)
    : process.env.DB_PASSWORD,
  database: useUrlConfig
    ? parsedConnectionUrl.pathname.replace(/^\//, "")
    : process.env.DB_NAME,
  port: useUrlConfig
    ? Number(parsedConnectionUrl.port) || 3306
    : Number(process.env.DB_PORT) || 3306,
};

const missingVars = ["user", "database"].filter((key) => !dbConfig[key]);
if (missingVars.length > 0) {
  console.warn(
    `⚠️ Missing DB config value(s): ${missingVars.join(", ")}. ` +
      "Database connection may fail.",
  );
}

// Create a promise-based pool
const db = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  port: dbConfig.port,
  ...(isSslEnabled ? { ssl: { rejectUnauthorized: false } } : {}),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection
(async () => {
  try {
    const connection = await db.getConnection();
    connection.release();
  } catch (err) {
    console.error("❌ Database connection failed:", {
      message: err.message,
      code: err.code,
      host: dbConfig.host,
      port: dbConfig.port,
      ssl: isSslEnabled,
    });
  }
})();

export default db;
