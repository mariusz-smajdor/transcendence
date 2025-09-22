/**
 * Utility function to get the correct avatar URL
 * Handles both Google OAuth avatars (complete URLs) and uploaded avatars (relative paths)
 */
export function getAvatarUrl(
	avatar: string | null | undefined,
	fallbackName: string
): string {
	if (!avatar) {
		return `https://ui-avatars.com/api/?length=1&name=${fallbackName}&background=random`;
	}

	// If avatar is already a complete URL (Google OAuth), use it as-is
	if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
		return avatar;
	}

	// If avatar is a relative path (uploaded file), add server prefix
	return `http://localhost:3000${avatar}`;
}
