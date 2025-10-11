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
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT,
      email TEXT UNIQUE NOT NULL,
      totp_secret TEXT,
      avatar TEXT,
      google_id TEXT UNIQUE,
      firstName TEXT,
      lastName TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blacklisted_tokens (
      token TEXT PRIMARY KEY,
      expires_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id_1 INTEGER NOT NULL,
      user_id_2 INTEGER NOT NULL,
      FOREIGN KEY (user_id_1) REFERENCES users (id),
      FOREIGN KEY (user_id_2) REFERENCES users (id)
      UNIQUE (user_id_1, user_id_2)
    );
    
    CREATE TABLE IF NOT EXISTS friend_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      FOREIGN KEY (sender_id) REFERENCES users (id),
      FOREIGN KEY (receiver_id) REFERENCES users (id)
      UNIQUE (sender_id, receiver_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender INTEGER NOT NULL,
      receiver INTEGER NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      read BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (sender) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS match_history (
	  id INTEGER PRIMARY KEY AUTOINCREMENT,
	  user_id_1 INTEGER,
	  user_id_2 INTEGER,
	  score_player_1 INTEGER NOT NULL,
	  score_player_2 INTEGER NOT NULL,
	  match_date DATETIME NOT NULL,
	  game_type TEXT NOT NULL,
	  blockchain_tx TEXT,
	  FOREIGN KEY (user_id_1) REFERENCES users (id),
	  FOREIGN KEY (user_id_2) REFERENCES users (id)
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
