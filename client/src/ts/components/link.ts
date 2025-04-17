export interface LinkProps {
	content: string;
	href: string;
	classes?: string[];
}

export function Link({ content, href, classes = [] }: LinkProps) {
	const link = document.createElement('a');
	link.textContent = content;
	link.href = href;
	link.classList.add('underline-offset-3', ...classes!);

	return link;
}
