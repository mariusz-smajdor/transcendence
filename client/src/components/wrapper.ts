import { type ComponentProps } from '../types/component';

type WrapperProps = ComponentProps & {
	element?: 'div' | 'main' | 'section' | 'header';
};

export function Wrapper({ element = 'div', classes = [] }: WrapperProps) {
	const wrapper = document.createElement(element);
	wrapper.classList.add(...classes!);

	return wrapper;
}
