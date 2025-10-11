import { type ComponentProps } from '../types/component';

type CardProps = ComponentProps & {
	element?: 'div' | 'section' | 'main';
};

export function Card({ element = 'div', classes = [] }: CardProps) {
	const card = document.createElement(element);
	card.classList.add(
		'p-4',
		'lg:p-6',
		'bg-foreground',
		'rounded',
		'border',
		'border-accent',
		...classes!
	);

	return card;
}
