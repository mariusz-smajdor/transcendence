import { ComponentProps } from '../types/component';
import { type IconNode, createElement } from 'lucide';

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
