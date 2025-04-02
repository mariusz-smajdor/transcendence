import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import cors from '@fastify/cors';
import fs from 'fs';
import path from 'path';

const fastify = Fastify({
	logger: true,
});

fastify.register(multipart);
fastify.register(cors, {
	origin: '*',
	methods: ['GET', 'POST'],
	allowedHeaders: ['Content-Type'],
})

fastify.get('/', async (request, reply) => {
	return { hello: 'world' };
});

fastify.post('/register', async (request, reply) => {
  const parts = await request.parts(); // Get parts (text fields and files)

  const formData = {};  // Create an empty object to store form data
  let avatarPath = null;

  // Loop through the parts and fill formData object
  for await (const part of parts) {
    if (part.file) {
      // If it's a file part
      avatarPath = path.join(__dirname, 'uploads', part.filename);
      await fs.promises.writeFile(avatarPath, await part.toBuffer());
    } else {
      // If it's a text field
      formData[part.fieldname] = part.value;
    }
  }

  console.log('Received Data:', formData);
  
  reply.send({ success: true, data: formData, avatar: avatarPath ? `uploads/${path.basename(avatarPath)}` : null });
});

try {
	await fastify.listen({ port: 3000, host: '0.0.0.0' });
} catch (err) {
	fastify.log.error(err);
	process.exit(1);
}
