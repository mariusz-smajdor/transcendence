import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

/**
 * Delete an avatar file from the filesystem
 * @param {string} avatarPath - The avatar path from the database
 * @returns {boolean} - True if file was deleted, false otherwise
 */
export function deleteAvatarFile(avatarPath) {
  if (!avatarPath) return false;

  // Don't delete Google OAuth avatars (they start with https or external http)
  if (
    avatarPath.startsWith('https') ||
    !avatarPath.startsWith('http://localhost:3000')
  )
    return false;

  try {
    // Convert database path to filesystem path
    const relativePath = avatarPath.replace('http://localhost:3000', '');
    const fullPath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      '..',
      '..',
      relativePath,
    );

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log('Deleted avatar file:', fullPath);
      return true;
    }
  } catch (error) {
    console.error('Error deleting avatar file:', error);
  }

  return false;
}

/**
 * Clean up orphaned avatar files by checking which files exist
 * but are not referenced in the database
 * @param {Database} db - The database connection
 */
export function cleanupOrphanedAvatars(db) {
  try {
    const uploadsDir = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      '..',
      '..',
      'uploads',
      'avatars',
    );

    if (!fs.existsSync(uploadsDir)) {
      console.log('Uploads directory does not exist, skipping cleanup');
      return;
    }

    // Get all avatar paths from database
    const users = db
      .prepare('SELECT avatar FROM users WHERE avatar IS NOT NULL')
      .all();
    const dbAvatarPaths = new Set(
      users
        .map((user) => user.avatar)
        .filter(
          (avatar) => avatar && avatar.startsWith('http://localhost:3000'),
        ) // Only uploaded avatars
        .map((avatar) => avatar.replace('http://localhost:3000', '')),
    );

    // Get all files in uploads directory
    const files = fs.readdirSync(uploadsDir);
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const relativePath = `/uploads/avatars/${file}`;

      // If file is not referenced in database, delete it
      if (!dbAvatarPaths.has(relativePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log('Deleted orphaned avatar file:', filePath);
          deletedCount++;
        } catch (error) {
          console.error('Error deleting orphaned file:', error);
        }
      }
    }

    console.log(
      `Cleanup complete. Deleted ${deletedCount} orphaned avatar files.`,
    );
  } catch (error) {
    console.error('Error during avatar cleanup:', error);
  }
}
