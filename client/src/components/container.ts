import { type ComponentProps } from '../types/component';

type ContainerProps = ComponentProps & {
	element?: 'div' | 'main' | 'section' | 'header';
};

export function Container({ element = 'div', classes = [] }: ContainerProps) {
	const container = document.createElement(element);
	container.classList.add('container', 'mx-auto', 'px-6', ...classes!);

	return container;
}
