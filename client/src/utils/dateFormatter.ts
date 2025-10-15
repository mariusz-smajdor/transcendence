/**
 * Format a date string to a human-readable format
 * @param dateString - ISO format date string (YYYY-MM-DD HH:MM:SS or ISO 8601)
 * @returns Formatted date string
 */
export function formatMatchDate(dateString: string): string {
	try {
		// Database stores timestamps in UTC format (YYYY-MM-DD HH:MM:SS)
		// We need to treat them as UTC by adding 'Z' suffix
		const utcDateString = dateString.includes('T')
			? dateString
			: dateString + 'Z';
		const date = new Date(utcDateString);

		// Check if date is valid
		if (isNaN(date.getTime())) {
			return dateString; // Return original if invalid
		}

		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		// If today, show time
		if (diffDays === 0) {
			return date.toLocaleTimeString('en-US', {
				hour: '2-digit',
				minute: '2-digit',
			});
		}

		// If yesterday
		if (diffDays === 1) {
			return 'Yesterday';
		}

		// If within last week, show day name
		if (diffDays < 7) {
			return date.toLocaleDateString('en-US', { weekday: 'short' });
		}

		// If within current year, show month and day
		if (date.getFullYear() === now.getFullYear()) {
			return date.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
			});
		}

		// Otherwise show full date
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	} catch (error) {
		console.error('Error formatting date:', error);
		return dateString;
	}
}

/**
 * Format a date string to full format with time
 * @param dateString - ISO format date string
 * @returns Full formatted date string with time
 */
export function formatFullDateTime(dateString: string): string {
	try {
		// Database stores timestamps in UTC format (YYYY-MM-DD HH:MM:SS)
		// We need to treat them as UTC by adding 'Z' suffix
		const utcDateString = dateString.includes('T')
			? dateString
			: dateString + 'Z';
		const date = new Date(utcDateString);

		if (isNaN(date.getTime())) {
			return dateString;
		}

		return date.toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			timeZone: 'Europe/Warsaw',
		});
	} catch (error) {
		console.error('Error formatting date:', error);
		return dateString;
	}
}
