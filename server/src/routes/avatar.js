import { fastify } from 'fastify';

export async function avatarRoutes(fastify) {
  // Proxy endpoint for Google avatars
  fastify.get('/avatar/proxy', async (req, res) => {
    try {
      const { url } = req.query;

      if (!url) {
        return res.code(400).send({ error: 'URL parameter is required' });
      }

      // Validate that it's a Google avatar URL
      if (
        !url.includes('googleusercontent.com') &&
        !url.includes('googleapis.com')
      ) {
        return res
          .code(400)
          .send({ error: 'Only Google avatar URLs are allowed' });
      }

      // Fetch the avatar from Google
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AvatarProxy/1.0)',
        },
      });

      if (!response.ok) {
        return res
          .code(response.status)
          .send({ error: 'Failed to fetch avatar' });
      }

      const imageBuffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      // Set appropriate headers
      res.header('Content-Type', contentType);
      res.header('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
      res.header('Access-Control-Allow-Origin', 'https://localhost:8080');
      res.header('Access-Control-Allow-Credentials', 'true');

      return res.send(Buffer.from(imageBuffer));
    } catch (error) {
      console.error('Avatar proxy error:', error);
      return res.code(500).send({ error: 'Internal server error' });
    }
  });
}
