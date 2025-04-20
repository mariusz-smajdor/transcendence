import { type ComponentProps } from '../types/component';

interface SpanProps extends ComponentProps {
	content: string;
}

export function Span({ content, classes = [] }: SpanProps) {
	const span = document.createElement('span');
	span.textContent = content;
	span.classList.add(...classes!);

	return span;
}
