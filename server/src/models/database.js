import Database from 'better-sqlite3';
import * as path from 'path';
import fp from 'fastify-plugin';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const DB_PATH = path.join(dirname, '..', '..', 'database.db');

const dbConnector = async (fastify, options) => {
  console.log(DB_PATH);
  const db = new Database(DB_PATH);
  db.exec('PRAGMA foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      totp_secret TEXT NOT NULL,
      avatar TEXT
    );

    CREATE TABLE IF NOT EXISTS blacklisted_tokens (
      token TEXT PRIMARY KEY,
      expires_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS friend_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      FOREIGN KEY (sender_id) REFERENCES users (id),
      FOREIGN KEY (receiver_id) REFERENCES users (id)
    );
  `);

  fastify.decorate('db', db);
  fastify.addHook('onClose', (instance, done) => {
    instance.db.close();
    done();
  });

  return db;
};

export default fp(dbConnector);
