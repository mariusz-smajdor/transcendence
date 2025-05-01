import User from '../models/userModel.js';

class AuthController {
  constructor(fastify) {
    this.fastify = fastify;
  }

  async register(req, res) {
    const { username, password, email } = req.body;

    const user = new User(username, password, email);

    const { success, message, code, qrCode, secret } = await user.register(
      this.fastify.db,
    );

    return res.status(code).send({ success, message, qrCode, secret });
  }

  async login(req, res) {
    const { username, password, totpToken } = req.body;
    const userData = new User(username, password);

    const { success, message, user, code } = await userData.login(
      req.context.config.db,
      totpToken,
    );

    if (!success) return res.status(code).send({ success, message });

    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    const token = req.jwt.sign(payload, { expiresIn: '1h' });
    res.setCookie('access_token', token, {
      path: '/',
      httpOnly: true,
      secure: true,
    });
    return res.status(code).send({ success, message, user });
  }

  async loginGoogle(req, res) {
    try {
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
  }
}

export default AuthController;
