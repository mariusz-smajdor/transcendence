import { ComponentProps } from '../types/component';
import { Wrapper } from './wrapper';

interface FormProps extends ComponentProps {
	method?: 'GET' | 'POST';
}

export function Separator() {
	const wrapper = Wrapper({
		classes: ['flex', 'items-center', 'gap-2', 'w-full'],
	});

	const line = document.createElement('div');
	line.classList.add('h-px', 'flex-1', 'bg-accent');

	const text = document.createElement('span');
	text.textContent = 'or';
	text.classList.add('text-xs', 'text-muted', 'whitespace-nowrap');

	wrapper.appendChild(line);
	wrapper.appendChild(text);
	wrapper.appendChild(line.cloneNode(true));

	return wrapper;
}

export function Form({ method = 'GET' }: FormProps) {
	const form = document.createElement('form');
	form.setAttribute('method', method);
	form.classList.add('flex', 'flex-col', 'gap-4', 'w-full');

	return form;
}
