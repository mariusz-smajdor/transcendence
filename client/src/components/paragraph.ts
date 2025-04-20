import { type ComponentProps } from '../types/component';

interface ParagraphProps extends ComponentProps {
	content: string;
}

export function Paragraph({ content, classes = [] }: ParagraphProps) {
	const paragraph = document.createElement('p');
	paragraph.textContent = content;
	paragraph.classList.add('text-muted', 'mt-4', ...classes!);

	return paragraph;
}
