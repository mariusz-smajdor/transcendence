import { type ComponentProps } from '../types/component';

type TextProps = ComponentProps & {
	element?: 'span' | 'p';
	content?: string;
};

export function Text({
	element = 'span',
	content = '',
	classes = [],
}: TextProps) {
	const text = document.createElement(element);
	text.textContent = content;
	text.classList.add(...classes!);

	return text;
}
