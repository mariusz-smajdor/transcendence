interface TitileProps {
	level: 1 | 2 | 3 | 4 | 5 | 6;
	content: string;
	classes?: string[];
}

export function Title({ level, content, classes = [] }: TitileProps) {
	const title = document.createElement(`h${level}`) as HTMLHeadingElement;
	title.textContent = content;
	title.classList.add('text-xl', ...classes!);

	return title;
}
