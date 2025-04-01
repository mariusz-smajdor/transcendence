import { Button, GoogleButton } from '../components/button.js';

function Separator(): HTMLElement {
	const wrapper = document.createElement('div');
	wrapper.classList.add(
		'flex',
		'items-center',
		'justify-center',
		'mb-4',
		'text-gray-500'
	);

	const separator = document.createElement('div');
	separator.classList.add(
		'border-b-1',
		'border-gray-300',
		'h-1',
		'w-full',
		'mx-1'
	);

	const span = document.createElement('span');
	span.textContent = 'or';

	wrapper.appendChild(separator);
	wrapper.appendChild(span);
	wrapper.appendChild(separator.cloneNode(true));

	return wrapper;
}

function Input(type: string, placeholder: string): HTMLElement {
	const input = document.createElement('input');

	input.type = type;
	input.classList.add(
		'rounded',
		'border',
		'border-gray-300',
		'p-2',
		'mb-4',
		'w-full'
	);
	input.placeholder = placeholder;

	return input;
}

function Heading(): HTMLElement {
	const heading = document.createElement('h1');
	heading.textContent = 'Login';
	heading.classList.add('text-2xl', 'font-bold', 'mb-4');

	return heading;
}

export default function Login(): HTMLElement {
	// create secrion container element
	const form = document.createElement('form');
	form.classList.add('max-w-md', 'mx-auto', 'mt-10', 'p-6');

	form.appendChild(Heading());
	form.appendChild(Input('text', 'Username'));
	form.appendChild(Input('password', 'Password'));
	form.appendChild(
		Button({
			type: 'submit',
			content: 'Sign Up',
		})
	);
	form.appendChild(Separator());
	form.appendChild(GoogleButton());

	return form;
}
