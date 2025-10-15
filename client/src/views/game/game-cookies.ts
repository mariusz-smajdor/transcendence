export function getCookie(name: string): string | undefined {
	return document.cookie
		.split('; ')
		.find((row) => row.startsWith(name + '='))
		?.split('=')[1];
}

export function deleteCookie(name: string): void {
	document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
}
