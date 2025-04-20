import { type ComponentProps } from '../types/component';

interface ContainerProps extends ComponentProps {
	element?: 'div' | 'section' | 'main';
}

export function Container({ element = 'div', classes = [] }: ContainerProps) {
	const container = document.createElement(element);
	container.classList.add('container', 'mx-auto', 'px-6', ...classes);

	return container;
}
