export function getCookie(name:string) :string | undefined{
	return document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='))
        ?.split('=')[1];
}