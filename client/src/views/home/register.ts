import { Button } from '../../components/button';
import { Heading } from '../../components/heading';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import { Tab } from '../../components/tabs';
import { Wrapper } from '../../components/wrapper';

function registerUser(
	form: HTMLFormElement,
	emailInput: HTMLInputElement,
	usernameInput: HTMLInputElement,
	passwordInput: HTMLInputElement
) {
	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		const registerData = {
			email: emailInput.value,
			username: usernameInput.value,
			password: passwordInput.value,
		};

		try {
			const res = await fetch('http://localhost:3000/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(registerData),
			});

			if (!res.ok) {
				console.log('Error !res.ok:', res.statusText);
			}
			const data = await res.json();
			if (data.error) {
				console.log('Error data.error:', data.error);
			} else {
				console.log('User registered successfully:', data);
				// Optionally, redirect or show a success message
			}
		} catch (error) {
			console.error('Error registering user:', error);
		}
	});
}

export default function Register() {
	const tab = Tab({
		value: 'register',
		classes: ['flex', 'flex-col', 'gap-4', 'lg:gap-6'],
	});
	const heading = Heading({
		level: 3,
		content: 'Create your account!',
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
		name: 'set-email',
		id: 'set-email',
		placeholder: 'example@email.com',
		required: true,
	});
	const usernameLabel = Label({
		content: 'Username:',
		classes: ['flex', 'flex-col', 'gap-2'],
	});
	const usernameInput = Input({
		type: 'text',
		name: 'set-username',
		id: 'set-username',
		placeholder: 'your username',
		required: true,
	});
	const passwordLabel = Label({
		content: 'Password:',
		classes: ['flex', 'flex-col', 'gap-2'],
	});
	const passwordInput = Input({
		type: 'password',
		name: 'set-password',
		id: 'set-password',
		placeholder: '********',
		required: true,
	});

	registerUser(form, emailInput, usernameInput, passwordInput);

	emailLabel.appendChild(emailInput);
	usernameLabel.appendChild(usernameInput);
	passwordLabel.appendChild(passwordInput);
	form.appendChild(emailLabel);
	form.appendChild(usernameLabel);
	form.appendChild(passwordLabel);
	form.appendChild(Button({ content: 'Sign up', type: 'submit' }));
	tab.appendChild(heading);
	tab.appendChild(form);

	return tab;
}
