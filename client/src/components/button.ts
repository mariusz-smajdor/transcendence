import { type ComponentProps } from '../types/component';

type ButtonVariant = 'primary' | 'outline' | 'ghost';

type ButtonProps = ComponentProps & {
	variant?: ButtonVariant;
	type?: 'button' | 'submit';
	content?: string;
};

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
				'px-2',
				'py-1',
			];
		case 'ghost':
			return [
				'p-1',
				'bg-transparent',
				'border',
				'border-transparent',
				'hover:bg-primary',
				'hover:border-primary',
			];
		case 'outline':
			return [
				'bg-transparent',
				'border',
				'border-primary',
				'hover:bg-primary',
				'px-2',
				'py-1',
			];
	}
}

export function Button({
	type = 'button',
	variant = 'primary',
	content,
	classes = [],
}: ButtonProps) {
	const button = document.createElement('button');
	button.type = type;

	button.classList.add(
		'cursor-pointer',
		'rounded',
		'transition-colors',
		'duration-300',
		...getVariantClasses(variant),
		...classes
	);

	if (content) {
		button.textContent = content;
	}

	return button;
}
