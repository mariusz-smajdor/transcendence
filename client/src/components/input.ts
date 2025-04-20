import { ComponentProps } from '../types/component';

interface InputProps extends ComponentProps {
	type: 'text' | 'email' | 'password';
	name: string;
	placeholder?: string;
	id?: string;
	disabled?: boolean;
	required?: boolean;
}

export function Input({
	type = 'text',
	placeholder,
	name,
	id,
	required = false,
	classes = [],
}: InputProps) {
	const input = document.createElement('input');
	input.type = type;
	input.classList.add(
		'rounded',
		'border',
		'border-accent',
		'py-1.5',
		'px-3',
		'w-full',
		'text-sm',
		...classes
	);
	input.name = name;
	input.required = required;

	if (placeholder) {
		input.placeholder = placeholder;
	}
	if (id) {
		input.id = id;
	}

	return input;
}
