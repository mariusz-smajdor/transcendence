import { type ComponentProps } from '../types/component';

export function Container({ classes = [] }: ComponentProps) {
	const div = document.createElement('div');
	div.classList.add('container', 'mx-auto', 'px-6', ...classes);

	return div;
}
