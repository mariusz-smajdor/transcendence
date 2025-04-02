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
	heading.textContent = 'Register';
	heading.classList.add('text-2xl', 'font-bold', 'mb-4');

	return heading;
}

export default function Register(): HTMLElement {
	const form = document.createElement('form');
	form.classList.add('max-w-md', 'mx-auto', 'mt-10', 'p-6');

	const usernameInput = Input('text', 'Username') as HTMLInputElement;
	const emailInput = Input('email', 'Email') as HTMLInputElement;
	const passwordInput = Input('password', 'Password') as HTMLInputElement;
	const confirmPasswordInput = Input('password', 'Confirm Password') as HTMLInputElement;

	form.appendChild(Heading());
	form.appendChild(usernameInput);
	form.appendChild(emailInput);
	form.appendChild(passwordInput);
	form.appendChild(confirmPasswordInput);
	form.appendChild(
		Button({
			type: 'submit',
			content: 'Sign Up',
		})
	);
	form.appendChild(Separator());
	form.appendChild(GoogleButton());

	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		const formData = new FormData();
		formData.append('username', usernameInput.value);
		formData.append('email', emailInput.value);
		formData.append('password', passwordInput.value);
		formData.append('confirmPassword', confirmPasswordInput.value);

		try {
			const response = await fetch('http://localhost:3000/register', {
				method: 'POST',
				body: formData,
			});

			const result = await response.json();
			console.log('Server Response:', result);
		} catch (error) {
			console.error('Error submitting form:', error);
		}
	});

	return form;
}
