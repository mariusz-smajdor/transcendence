export default function Login(): HTMLElement {
	const section = document.createElement('section');
	
	const heading = document.createElement('h1');
	heading.textContent = 'Login';
	
	section.appendChild(heading);
	
	return section;
}