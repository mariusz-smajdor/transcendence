import {
  addUser,
  loginUser,
  getCurrentUser,
} from "../controllers/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

async function userRoutes(fastify, options) {
  fastify.post("/register", addUser);
  fastify.post("/login", loginUser);

  // Protected route - requires JWT authentication
  fastify.get(
    "/me",
    {
      preHandler: [authenticateToken],
    },
    getCurrentUser
  );
}

export default userRoutes;
