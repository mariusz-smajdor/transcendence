import { ComponentProps } from '../types/component';

interface TitileProps extends ComponentProps {
	level: 1 | 2 | 3 | 4 | 5 | 6;
	content: string;
}

export function Title({ level, content, classes = [] }: TitileProps) {
	const h = document.createElement(`h${level}`);
	h.textContent = content;
	h.classList.add('text-xl', ...classes!);

	return h;
}
