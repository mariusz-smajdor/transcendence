const Database = require('better-sqlite3')
const path = require('path')
const fp = require('fastify-plugin')

const DB_PATH = path.join(__dirname, '..', '..', 'database.db')

const dbConnector = async (fastify, options) => {
	const db = new Database(DB_PATH)

	db.exec(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			email TEXT UNIQUE NOT NULL
		);
	`)

	fastify.decorate('db', db)

	fastify.addHook('onClose', (instance, done) => {
		instance.db.close()
		done()
	})

	return db
}

module.exports = fp(dbConnector)
