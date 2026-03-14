import fs from "node:fs";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: ".env.production" });
dotenv.config();

const rawUrl = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.DB_URL;

if (!rawUrl) {
  throw new Error("DATABASE_URL (or MYSQL_URL/DB_URL) is missing in backend/.env");
}

const parsedUrl = new URL(rawUrl);
const databaseName = (parsedUrl.pathname || "/railway").replace(/^\//, "") || "railway";
const sanitizedDatabaseName = databaseName.replace(/[^a-zA-Z0-9_]/g, "");

if (!sanitizedDatabaseName) {
  throw new Error("Invalid database name parsed from DATABASE_URL");
}

const sqlPath = new URL("../../raphavets_db.sql", import.meta.url);
const sql = fs.readFileSync(sqlPath, "utf8");

const adminUrl = new URL(rawUrl);
adminUrl.pathname = "/mysql";

const sslOption = ["true", "1", "yes"].includes(
  String(process.env.DB_SSL || "true").toLowerCase(),
)
  ? { rejectUnauthorized: false }
  : undefined;

const adminConnection = await mysql.createConnection({
  uri: adminUrl.toString(),
  ssl: sslOption,
  multipleStatements: true,
});

await adminConnection.query(`CREATE DATABASE IF NOT EXISTS ${sanitizedDatabaseName}`);
await adminConnection.end();

const targetConnection = await mysql.createConnection({
  uri: rawUrl,
  ssl: sslOption,
  multipleStatements: true,
});

await targetConnection.query(sql);
await targetConnection.end();

