import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import cors from '@fastify/cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const fastify = Fastify({ logger: true });

fastify.register(multipart);
fastify.register(cors, {
	origin: '*',
	methods: ['GET', 'POST'],
	allowedHeaders: ['Content-Type'],
});

const db = await open({
	filename: path.join(process.cwd(), 'database', 'database.sqlite'),
	driver: sqlite3.Database,
});

await db.exec(`
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT UNIQUE NOT NULL,
		email TEXT UNIQUE NOT NULL,
		password TEXT NOT NULL
	);
`);

fastify.get('/', async (request, reply) => {
	try {
    const users = await db.all('SELECT * FROM users');
    reply.send({ success: true, users });
  } catch (error) {
    reply.status(500).send({ success: false, error: error.message });
  }
});

fastify.post('/register', async (request, reply) => {
	try {
		const parts = request.parts();
		const formData = {};

		for await (const part of parts) {
			formData[part.fieldname] = part.value;
		}
		const result = await db.run(
			'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
			[formData.username, formData.email, formData.password]
		);

		reply.send({ success: true, userId: result.lastID });
	} catch (error) {
		reply.status(500).send({ success: false, error: error.message });
	}
});

try {
	await fastify.listen({ port: 3000, host: '0.0.0.0' });
} catch (err) {
	fastify.log.error(err);
	process.exit(1);
}
