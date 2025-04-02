import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import cors from '@fastify/cors';

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
  const parts = request.parts();
  const formData = {};

  for await (const part of parts) {
      formData[part.fieldname] = part.value;
  }

  console.log('Received Data:', formData);
  
  reply.send({ success: true, data: formData});
});

try {
	await fastify.listen({ port: 3000, host: '0.0.0.0' });
} catch (err) {
	fastify.log.error(err);
	process.exit(1);
}
