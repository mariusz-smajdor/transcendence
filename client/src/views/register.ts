import { Container } from '../components/container';
import { Wrapper } from '../components/wrapper';
import { Form, Separator } from '../components/form';
import { Input } from '../components/input';
import { Label } from '../components/label';
import { Title } from '../components/title';
import { Button, GoogleButton } from '../components/button';
import { Paragraph } from '../components/paragraph';
import { Link } from '../components/link';

function AuthLink() {
	const wrapper = Wrapper({
		classes: ['flex', 'gap-1', 'w-full'],
	});
	const p = Paragraph({
		content: 'Already have an account? ',
		classes: ['text-sm', 'mt-[0]'],
	});
	const link = Link({
		content: 'Sign in',
		href: 'login',
		classes: ['text-sm', 'text-primary'],
	});
	p.appendChild(link);
	wrapper.appendChild(p);

	return wrapper;
}

function AuthForm() {
	const form = Form({ method: 'POST' });

	const emailInput = Input({
		id: 'email',
		name: 'email',
		type: 'email',
		required: true,
	});
	const usernameInput = Input({
		id: 'username',
		name: 'username',
		type: 'text',
		required: true,
	});
	const passwordInput = Input({
		id: 'password',
		name: 'password',
		type: 'password',
		required: true,
	});
	const confirmPasswordInput = Input({
		id: 'confirm-password',
		name: 'confirm-password',
		type: 'password',
		required: true,
	});

	const emailWrapper = Wrapper({});
	emailWrapper.appendChild(Label({ content: 'Email', id: 'email' }));
	emailWrapper.appendChild(emailInput);

	const usernameWrapper = Wrapper({});
	usernameWrapper.appendChild(Label({ content: 'Username', id: 'username' }));
	usernameWrapper.appendChild(usernameInput);

	const passwordWrapper = Wrapper({});
	passwordWrapper.appendChild(Label({ content: 'Password', id: 'password' }));
	passwordWrapper.appendChild(passwordInput);

	const confirmPasswordWrapper = Wrapper({});
	confirmPasswordWrapper.appendChild(
		Label({ content: 'Confirm Password', id: 'confirm-password' })
	);
	confirmPasswordWrapper.appendChild(confirmPasswordInput);

	form.appendChild(
		Title({ level: 1, content: 'Sign in', classes: ['font-light', 'mt-0'] })
	);
	form.appendChild(emailWrapper);
	form.appendChild(usernameWrapper);
	form.appendChild(passwordWrapper);
	form.appendChild(confirmPasswordWrapper);

	form.appendChild(Button({ type: 'submit', content: 'Sign in' }));

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		const object = {
			username: usernameInput.value,
			email: emailInput.value,
			password: passwordInput.value,
			confirmPassword: confirmPasswordInput.value,
		};

		try {
			console.log(JSON.stringify(object));
			const response = await fetch('http://localhost:3000/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(object),
			});

			const result = await response.json();
			console.log('Server Response:', result);
		} catch (error) {
			console.error('Error submitting form:', error);
		}
	});

	return form;
}

export default function Login() {
	const container = Container({
		element: 'main',
		classes: [
			'h-screen',
			'flex',
			'flex-col',
			'items-center',
			'justify-center',
			'gap-4',
			'w-full',
			'max-w-sm',
		],
	});

	container.appendChild(AuthForm());
	container.appendChild(AuthLink());
	container.appendChild(Separator());
	container.appendChild(GoogleButton());

	return container;
}
