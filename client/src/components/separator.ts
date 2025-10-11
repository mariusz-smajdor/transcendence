import { Wrapper } from './wrapper';

export function Separator() {
	const wrapper = Wrapper({
		classes: ['flex', 'items-center', 'gap-2', 'w-full'],
	});

	const line = document.createElement('div');
	line.classList.add('h-px', 'flex-1', 'bg-accent');

	const text = document.createElement('span');
	text.textContent = 'or';
	text.classList.add('text-xs', 'text-muted', 'whitespace-nowrap');

	wrapper.appendChild(line);
	wrapper.appendChild(text);
	wrapper.appendChild(line.cloneNode(true));

	return wrapper;
}
