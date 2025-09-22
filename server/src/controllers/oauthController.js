import { google } from 'googleapis';

// Google OAuth handler - redirects to Google's OAuth consent screen
export const googleOAuthHandler = async (req, res) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      req.server.config.GOOGLE_CLIENT_ID,
      req.server.config.GOOGLE_CLIENT_SECRET,
      `${req.protocol}://${req.hostname}:${req.server.config.PORT}/auth/google/callback`,
    );

    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true,
    });

    return res.redirect(authUrl);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return res.status(500).send({
      success: false,
      message: 'OAuth initialization failed',
    });
  }
};

// Google OAuth callback handler - processes the authorization code
export const googleOAuthCallbackHandler = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send({
        success: false,
        message: 'Authorization code not provided',
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      req.server.config.GOOGLE_CLIENT_ID,
      req.server.config.GOOGLE_CLIENT_SECRET,
      `${req.protocol}://${req.hostname}:${req.server.config.PORT}/auth/google/callback`,
    );

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    const db = req.context.config.db;

    // Check if user already exists
    let user = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(userInfo.email);

    if (!user) {
      // Create new user
      const insertUser = db.prepare(`
        INSERT INTO users (username, email, firstName, lastName, avatar, google_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const result = insertUser.run(
        userInfo.name || userInfo.email.split('@')[0],
        userInfo.email,
        userInfo.given_name || '',
        userInfo.family_name || '',
        userInfo.picture || null,
        userInfo.id,
        new Date().toISOString(),
      );

      user = {
        id: result.lastInsertRowid,
        username: userInfo.name || userInfo.email.split('@')[0],
        email: userInfo.email,
        firstName: userInfo.given_name || '',
        lastName: userInfo.family_name || '',
        avatar: userInfo.picture || null,
        google_id: userInfo.id,
      };
    } else {
      // Update existing user with Google info if needed
      if (!user.google_id) {
        const updateUser = db.prepare(`
          UPDATE users 
          SET google_id = ?, avatar = COALESCE(avatar, ?), firstName = COALESCE(firstName, ?), lastName = COALESCE(lastName, ?)
          WHERE id = ?
        `);
        updateUser.run(
          userInfo.id,
          userInfo.picture,
          userInfo.given_name || '',
          userInfo.family_name || '',
          user.id,
        );
      }
    }

    // Generate JWT token
    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const token = req.jwt.sign(payload, { expiresIn: '1h' });

    // Set cookie
    res.setCookie('access_token', token, {
      path: '/',
      httpOnly: false,
      secure: false,
    });

    // Redirect to client with success
    return res.redirect('http://localhost:8080/?oauth=success');
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return res.redirect('http://localhost:8080/?oauth=error');
  }
};
