const fastify = require("fastify")();
const fjwt = require("@fastify/jwt");
const fCookie = require("@fastify/cookie");
const dbConnector = require("./src/models/database");
const cors = require("@fastify/cors");
const multipart = require("@fastify/multipart");

const gameChatRoutes = require("./src/routes/gameChat");
const privateChatRoutes = require("./src/routes/privateChat");
const userAuthenticationRoutes = require("./src/routes/userAuthentication");

// Register @fastify/env
fastify.register(require("@fastify/env"), {
  confKey: "config",
  schema: {
    type: "object",
    required: ["JWT_SECRET", "COOKIES_SECRET"],
    properties: {
      PORT: { type: "number", default: 3000 },
      JWT_SECRET: { type: "string" },
      COOKIES_SECRET: { type: "string" },
    },
  },
  dotenv: true, // Automatically load .env file
});

// Wait for @fastify/env to load before registering dependent plugins
fastify.after((err) => {
  if (err) {
    fastify.log.error("Error loading @fastify/env:", err);
    process.exit(1);
  }

  // Register plugins that depend on fastify.config
  fastify.register(fjwt, { secret: fastify.config.JWT_SECRET });

  fastify.register(fCookie, {
    secret: fastify.config.COOKIES_SECRET,
    hook: "preHandler",
  });
});

// Register plugins that don't depend on fastify.config
fastify.register(multipart);
fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
});

// Register websockets
fastify.register(require("@fastify/websocket"), {
  options: { clientTracking: true },
});

// Add JWT to request context
fastify.addHook("preHandler", (req, res, next) => {
  req.context = req.context || {};
  req.jwt = fastify.jwt;
  return next();
});

// Register database
fastify.register(dbConnector);

// Register routes
fastify.register(userAuthenticationRoutes); // /register /login /logout
fastify.register(gameChatRoutes); // /gameChat/gameId
fastify.register(privateChatRoutes); // /privateChat/userId

// Start server after all plugins are loaded
fastify.ready((err) => {
  if (err) {
    fastify.log.error("Error during plugin registration:", err);
    process.exit(1);
  }

  fastify.listen({ port: fastify.config.PORT, host: "localhost" }, (err) => {
    if (err) {
      fastify.log.error("Error starting server:", err);
      process.exit(1);
    }
    fastify.log.info(
      `Server listening on http://localhost:${fastify.config.PORT}`
    );
  });
});
