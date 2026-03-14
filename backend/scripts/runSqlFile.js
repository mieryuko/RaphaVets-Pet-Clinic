import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: ".env.production" });
dotenv.config();

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: node scripts/runSqlFile.js <sql-file-path>");
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL ?? process.env.MYSQL_URL ?? process.env.DB_URL;
if (!dbUrl) {
  console.error("DATABASE_URL (or MYSQL_URL/DB_URL) is missing in backend/.env");
  process.exit(1);
}

const resolvedPath = path.resolve(process.cwd(), inputPath);
if (!fs.existsSync(resolvedPath)) {
  console.error("SQL file not found: ${resolvedPath}");
  process.exit(1);
}

const sql = fs.readFileSync(resolvedPath, "utf8");
const useSsl = ["true", "1", "yes"].includes(
  String(process.env.DB_SSL ?? "true").toLowerCase()
);

let conn;

try {
  conn = await mysql.createConnection({
    uri: dbUrl,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    multipleStatements: true,
  });

  await conn.query(sql);
} catch (error) {
  console.error("Failed to execute SQL file.");
  console.error(error.message);
  if (error.code) console.error("Code:", error.code);
  if (error.sqlMessage) console.error("SQL Message:", error.sqlMessage);
  process.exit(1);
} finally {
  if (conn) await conn.end();
}
