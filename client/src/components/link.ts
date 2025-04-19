import { ComponentProps } from '../types/component';

interface LinkProps extends ComponentProps {
	content: string;
	href: string;
}

export function Link({ content, href, classes = [] }: LinkProps) {
	const link = document.createElement('a');
	link.textContent = content;
	link.href = href;
	link.classList.add('underline-offset-3', ...classes!);

	return link;
}
