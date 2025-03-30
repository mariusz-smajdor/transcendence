export default function Register(): HTMLElement {
	const section = document.createElement('section');

	const heading = document.createElement('h1');
	heading.textContent = 'Register';

	section.appendChild(heading);

	return section;
}
