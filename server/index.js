import "dotenv/config";
import initializeServer from "./src/app.js";

const start = async () => {
  try {
    const server = await initializeServer();
    await server.listen({ port: 3000, host: "0.0.0.0" });
    console.log(`Server is running on 0.0.0.0:3000`);
  } catch (err) {
    console.error("Server startup error:", err);
    process.exit(1);
  }
};

start();
