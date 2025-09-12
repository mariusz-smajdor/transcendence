import sqlite3 from "sqlite3";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path
const DB_PATH = join(__dirname, "database.sqlite");

// Create database connection
export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

// Initialize database with schema
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    const schemaPath = join(__dirname, "schema.sql");
    const schema = readFileSync(schemaPath, "utf8");

    db.exec(schema, (err) => {
      if (err) {
        console.error("Error initializing database:", err.message);
        reject(err);
      } else {
        console.log("Database schema initialized successfully");
        resolve();
      }
    });
  });
};

// Close database connection
export const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err.message);
        reject(err);
      } else {
        console.log("Database connection closed");
        resolve();
      }
    });
  });
};
