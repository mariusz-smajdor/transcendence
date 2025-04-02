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

function PictureInput() {
	const wrapper = document.createElement('div');
	wrapper.classList.add('relative', 'w-full');

	const clickableElement = document.createElement('div');
	clickableElement.classList.add(
		'rounded-full',
		'border',
		'border-gray-300',
		'p-2',
		'mb-4',
		'w-40',
		'h-40',
		'cursor-pointer',
		'flex',
		'items-center',
		'justify-center',
		'text-gray-500',
		'hover:bg-gray-100'
	);
	clickableElement.textContent = 'Upload Avatar';

	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.classList.add('hidden');
	fileInput.accept = 'image/*';

	clickableElement.addEventListener('click', () => {
		fileInput.click();
	});

	fileInput.addEventListener('change', (e) => {
		const target = e.target;
		if (target && target instanceof HTMLInputElement && target.files) {
			const file = target.files[0];
			if (file) {
				console.log(file.name);
			}
		}
	});

	wrapper.appendChild(clickableElement);
	wrapper.appendChild(fileInput);

	return wrapper;
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

	const pictureInputWrapper = PictureInput();
	const fileInput = pictureInputWrapper.querySelector('input[type=file]') as HTMLInputElement;

	form.appendChild(Heading());
	form.appendChild(pictureInputWrapper);
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

	form.addEventListener('submit', (event) => {
		event.preventDefault();
		const formData = {
			username: usernameInput.value,
			email: emailInput.value,
			password: passwordInput.value,
			confirmPassword: confirmPasswordInput.value,
			avatar: fileInput.files?.[0] || null,
		};

		console.log('Form Data:', formData);
	});

	return form;
}

