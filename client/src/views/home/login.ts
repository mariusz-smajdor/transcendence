import { Button } from '../../components/button';
import { Heading } from '../../components/heading';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import { Tab } from '../../components/tabs';
import { Wrapper } from '../../components/wrapper';

function loginUser(
	form: HTMLFormElement,
	emailInput: HTMLInputElement,
	passwordInput: HTMLInputElement
) {
	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		if (form.lastChild instanceof HTMLSpanElement) {
			form.removeChild(form.lastChild);
		}

		const submitMessage = document.createElement('span');
		submitMessage.classList.add('text-red-400', 'text-xs');

		const loginData = {
			email: emailInput.value,
			password: passwordInput.value,
		};

		try {
			const res = await fetch('http://localhost:3000/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(loginData),
				credentials: 'include',
			});
			console.log(loginData, res);
			const data = await res.json();
			console.log(data);
			if (!data.success) {
				submitMessage.textContent = data.message;
				form.appendChild(submitMessage);
			} else {
				submitMessage.textContent = 'Login successful!';
				submitMessage.classList.remove('text-red-400');
				submitMessage.classList.add('text-green-400');
				form.appendChild(submitMessage);
				emailInput.value = '';
				passwordInput.value = '';
				console.log('Login successful!');
			}
		} catch (error) {
			if (error instanceof Error) {
				submitMessage.textContent = error.message;
			} else {
				submitMessage.textContent =
					'An unknown error occurred. PLease try again.';
			}
			form.appendChild(submitMessage);
		}
	});
}

export default function Login() {
	const tab = Tab({
		value: 'login',
		classes: ['flex', 'flex-col', 'gap-4', 'lg:gap-6'],
	});
	const heading = Heading({
		level: 3,
		content: 'Welcome back!',
		classes: ['text-[1rem]', 'text-center'],
	});
	const form = Wrapper({
		element: 'form',
		method: 'POST',
		classes: ['flex', 'flex-col', 'gap-4', 'lg:gap-6'],
	}) as HTMLFormElement;
	const emailLabel = Label({
		content: 'Email address:',
		classes: ['flex', 'flex-col', 'gap-2'],
	});
	const emailInput = Input({
		type: 'email',
		name: 'email',
		id: 'email',
		placeholder: 'example@email.com',
		required: true,
	});
	const passwordLabel = Label({
		content: 'Password:',
		classes: ['flex', 'flex-col', 'gap-2'],
	});
	const passwordInput = Input({
		type: 'password',
		name: 'password',
		id: 'password',
		placeholder: '********',
		required: true,
	});

	loginUser(form, emailInput, passwordInput);

	emailLabel.appendChild(emailInput);
	passwordLabel.appendChild(passwordInput);
	form.appendChild(emailLabel);
	form.appendChild(passwordLabel);
	form.appendChild(Button({ content: 'Sign in', type: 'submit' }));
	tab.appendChild(heading);
	tab.appendChild(form);

	return tab;
}
