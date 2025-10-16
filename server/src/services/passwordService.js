import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import bcrypt from 'bcrypt';

class Password {
  static async hashPassword(password) {
    return new Promise((resolve, reject) => {
      const salt = randomBytes(16).toString('hex');

      scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(salt + ':' + derivedKey.toString('hex'));
      });
    });
  }

  static async comparePassword(password, hash) {
    // Check if it's a bcrypt hash (starts with $2a$, $2b$, $2x$, or $2y$)
    if (hash.startsWith('$2')) {
      return bcrypt.compare(password, hash);
    }

    // Otherwise, it's a scrypt hash (salt:key format)
    return new Promise((resolve, reject) => {
      const [salt, key] = hash.split(':');

      // Check if the hash is in the expected format
      if (!salt || !key) {
        resolve(false);
        return;
      }

      const keyBuffer = Buffer.from(key, 'hex'); // Convert stored key to a buffer

      scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) {
          reject(err);
          return;
        }

        // Use timingSafeEqual to securely compare the keys
        const derivedKeyBuffer = Buffer.from(derivedKey);
        if (
          keyBuffer.length === derivedKeyBuffer.length &&
          timingSafeEqual(keyBuffer, derivedKeyBuffer)
        ) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }
}

export default Password;
