interface LinkType {
	content: string;
	href: string;
	classes?: string[];
}

export function Link({ content, href, classes = [] }: LinkType) {
	const link = document.createElement('a');
	link.textContent = content;
	link.href = href;
	link.classList.add(...classes!);

	return link;
}
