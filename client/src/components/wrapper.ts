import { type ComponentProps } from '../types/component';

export function Wrapper({ classes }: ComponentProps) {
	const div = document.createElement('div');
	div.classList.add(...classes!);

	return div;
}
