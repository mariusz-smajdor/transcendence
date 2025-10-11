import { ComponentProps } from '../types/component';

type InputProps = ComponentProps & {
	type: 'text' | 'email' | 'password' | 'file';
	name: string;
	placeholder?: string;
	id?: string;
	required?: boolean;
	accept?: string;
};

export function Input({
	type = 'text',
	placeholder,
	name,
	id,
	required = false,
	accept,
	classes = [],
}: InputProps) {
	const input = document.createElement('input');
	input.type = type;
	input.classList.add(
		'rounded',
		'border',
		'border-accent',
		'px-3',
		'py-2',
		'w-full',
		'outline-primary',
		'focus:outline-1',
		'outline-offset-2',
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
	if (accept) {
		input.accept = accept;
	}

	return input;
}
