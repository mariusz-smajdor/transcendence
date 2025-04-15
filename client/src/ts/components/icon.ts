interface IconProps {
	name: string[];
	classes?: string[];
}

export function Icon({ name, classes = [] }: IconProps) {
	const icon = document.createElement('i');
	icon.classList.add(...name, ...classes!);

	return icon;
}
