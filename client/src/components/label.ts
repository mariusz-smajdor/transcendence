import { type ComponentProps } from '../types/component';

type LabelProps = ComponentProps & {
	content: string;
	id?: string;
};

export function Label({ id, content, classes }: LabelProps) {
	const label = document.createElement('label');
	label.textContent = content;
	label.classList.add('text-sm', ...classes!);
	if (id) {
		label.setAttribute('for', id);
	}

	return label;
}
