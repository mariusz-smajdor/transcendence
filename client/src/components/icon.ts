import { type IconNode, createElement } from 'lucide';
import { type ComponentProps } from '../types/component';

interface IconProps extends ComponentProps {
	icon: IconNode;
	strokeWidth?: number;
}

export function Icon({ icon, strokeWidth, classes = [] }: IconProps) {
	const svg = createElement(icon, {
		class: `h-6 w-6 ${classes.join(' ')}`,
		'stroke-width': strokeWidth || 2,
	});

	return svg;
}
