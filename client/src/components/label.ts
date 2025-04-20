import { ComponentProps } from '../types/component';

interface LabelProps extends ComponentProps {
	content: string;
	id?: string;
}

export function Label({ id, content }: LabelProps) {
	const label = document.createElement('label');
	label.textContent = content;
	label.classList.add('text-sm', 'mb-1');
	if (id) {
		label.setAttribute('for', id);
	}

	return label;
}
