interface IconProps {
	name: string[];
	classes?: string[];
}

export function Icon({ name, classes = [] }: IconProps) {
	const icon = document.createElement('i');
	icon.classList.add(...name, ...classes!);

	icon.addEventListener('click', (event) => event.stopPropagation());

	return icon;
}
