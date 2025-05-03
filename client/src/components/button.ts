import { type ComponentProps } from '../types/component';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'tab';

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
				'hover:bg-primary/50',
				'hover:border-primary/50',
				'px-3',
				'py-2',
			];
		case 'outline':
			return [
				'bg-transparent',
				'border',
				'border-secondary',
				'hover:bg-secondary',
				'text-secondary',
				'hover:text-white',
				'px-3',
				'py-2',
			];
		case 'ghost':
			return [
				'p-1',
				'bg-transparent',
				'border',
				'border-transparent',
				'hover:bg-primary/50',
			];
		case 'tab':
			return ['bg-accent', 'text-muted', 'px-2', 'py-1', 'hover:text-white'];
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
		'text-sm',
		...getVariantClasses(variant),
		...classes
	);

	if (content) {
		button.textContent = content;
	}

	return button;
}
