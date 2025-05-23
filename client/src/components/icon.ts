import { type IconNode, createElement } from 'lucide';
import { type ComponentProps } from '../types/component';

type Size = 'sm' | 'md' | 'lg' | 'xl';

type IconProps = ComponentProps & {
	icon: IconNode;
	strokeWidth?: number;
	size?: Size;
};

function getSizeClasses(size: Size) {
	switch (size) {
		case 'sm':
			return 'h-4 w-4';
		case 'lg':
			return 'h-7 w-7';
		case 'xl':
			return 'h-9 w-9';
		default:
			return 'h-5 w-5';
	}
}

export function Icon({
	icon,
	strokeWidth,
	size = 'md',
	classes = [],
}: IconProps) {
	const svg = createElement(icon, {
		class: `${getSizeClasses(size)} ${classes.join(' ')}`,
		'stroke-width': strokeWidth || 2,
	});

	return svg;
}
