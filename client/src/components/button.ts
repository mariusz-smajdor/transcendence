import type { ButtonProps, ButtonSize, ButtonVariant } from '../types/button';
import { Img } from './img';
import { Link } from './link';

function getSizeClasses(size: ButtonSize) {
	switch (size) {
		case 'icon':
			return ['p-1'];
		case 'sm':
			return ['px-3', 'py-1', 'text-sm'];
		case 'md':
			return ['px-3', 'py-1.5', 'text-sm'];
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
		case 'outline':
			return ['bg-transparent', 'border', 'border-accent', 'hover:bg-accent'];
	}
}

export function GoogleButton() {
	const button = Button({
		type: 'button',
		content: 'Authorize with Google',
		variant: 'outline',
		classes: ['w-full', 'gap-3', 'flex', 'flex-row-reverse', 'justify-center'],
	});
	const googleLogo = Img({
		src: 'google-logo.svg',
		alt: 'Google logo',
		width: 18,
		height: 18,
	});
	button.appendChild(googleLogo);

	return button;
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
