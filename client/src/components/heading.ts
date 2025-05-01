import { type ComponentProps } from '../types/component';

type HeadingProps = ComponentProps & {
	level: 1 | 2 | 3 | 4 | 5 | 6;
	content?: string;
};

export function Heading({ level, content = '', classes = [] }: HeadingProps) {
	const heading = document.createElement(`h${level}`);
	heading.textContent = content;
	heading.classList.add('font-bold', 'text-lg', ...classes!);

	return heading;
}
