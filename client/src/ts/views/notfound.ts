export default function NotFound(): HTMLElement {
	const section = document.createElement('section');
	
	const heading = document.createElement('h1');
	heading.textContent = '404';
	
	const paragraph = document.createElement('p');
	paragraph.textContent = 'Page not found.';
	
	section.appendChild(heading);
	section.appendChild(paragraph);
	
	return section;
}
