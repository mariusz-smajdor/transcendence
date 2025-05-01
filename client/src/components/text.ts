import { type ComponentProps } from '../types/component';

type TextProps = ComponentProps & {
	element?: 'span' | 'p';
	content?: string;
};

export function Span({
	element = 'span',
	content = '',
	classes = [],
}: TextProps) {
	const span = document.createElement(element);
	span.textContent = content;
	span.classList.add(...classes!);

	return span;
}
