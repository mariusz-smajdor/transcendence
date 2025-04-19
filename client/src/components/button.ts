import type { ButtonProps, ButtonSize, ButtonVariant } from '../types/button';
import { Link } from './link';

function getSizeClasses(size: ButtonSize) {
	switch (size) {
		case 'icon':
			return ['p-1'];
		case 'sm':
			return ['px-3', 'py-1', 'text-sm'];
		case 'md':
			return ['px-3', 'py-1'];
		case 'lg':
			return ['px-4.5', 'py-1.5'];
	}
}

function getVariantClasses(variant: ButtonVariant) {
	switch (variant) {
		case 'primary':
			return [
				'bg-primary',
				'text-white',
				'border',
				'border-primary',
				'hover:bg-primary/80',
				'hover:border-primary/80',
			];
		case 'ghost':
			return [
				'bg-transparent',
				'border',
				'border-transparent',
				'hover:bg-accent',
				'hover:border-accent',
			];
	}
}

export function Button({
	asLink = false,
	type = 'button',
	variant = 'primary',
	size = 'md',
	content,
	href,
	classes = [],
}: ButtonProps) {
	const button = document.createElement('button');
	button.type = type;

	const buttonClasses = [
		'cursor-pointer',
		'rounded',
		'transition-colors',
		'duration-200',
		...getSizeClasses(size),
		...getVariantClasses(variant),
		...classes,
	];

	if (asLink && href) {
		return Link({ content, href, classes: buttonClasses });
	}

	button.classList.add(...buttonClasses);

	if (content) {
		button.textContent = content;
	}

	return button;
}
