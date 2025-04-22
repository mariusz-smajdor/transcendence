import * as userAuthController from '../controllers/userAuthenticationController.js';
import User from '../models/userModel.js';

async function userAuthenticationRoutes(fastify) {
  fastify.post('/register', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await userAuthController.registrationHandler(req, res);
  });
  fastify.post('/login', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await userAuthController.loginHandler(req, res);
  });
  fastify.get('/login/google/callback', async (req, res) => {
    try {
      console.log('Query params', req.query);
      // Get access token and user info from Google
      const { token } =
        await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: { Authorization: `Bearer ${token.access_token}` },
        },
      );
      const userInfo = await userInfoResponse.json();

      // Extract user details
      const email = userInfo.email;
      const username = email.split('@')[0]; // Use email prefix as username
      const googleId = userInfo.id;

      // Check if user exists by email
      const existingUser = fastify.db
        .prepare('SELECT * FROM users WHERE email = ?')
        .get(email);

      let userResult;
      if (!existingUser) {
        // Register new user (no password, as it's Google auth)
        const user = new User(username, null, email);
        userResult = await user.register(fastify.db);
        if (!userResult.success) {
          return res.code(userResult.code).send({ error: userResult.message });
        }
      } else {
        // Log in existing user (bypass password and 2FA for Google auth)
        const user = new User(existingUser.username, null, email);
        userResult = await user.login(fastify.db);
        if (!userResult.success) {
          return res.code(userResult.code).send({ error: userResult.message });
        }
      }

      // Return success response
      return res.code(200).send({
        message: 'Google authentication successful',
        user: userResult.user,
      });
    } catch (err) {
      console.error(err);
      return res.code(500).send({ error: 'Internal server error' });
    }
  });
}

export default userAuthenticationRoutes;
