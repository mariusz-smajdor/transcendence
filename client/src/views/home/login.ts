import { Button } from '../../components/button';
import { Heading } from '../../components/heading';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import { Tab } from '../../components/tabs';
import { Wrapper } from '../../components/wrapper';

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
	});
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

	emailLabel.appendChild(emailInput);
	passwordLabel.appendChild(passwordInput);
	form.appendChild(emailLabel);
	form.appendChild(passwordLabel);
	form.appendChild(Button({ content: 'Sign in', type: 'submit' }));
	tab.appendChild(heading);
	tab.appendChild(form);

	return tab;
}
