import { Button } from '../../components/button';
import { Heading } from '../../components/heading';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import { Tab } from '../../components/tabs';
import { Wrapper } from '../../components/wrapper';

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
		classes: ['flex', 'flex-col', 'gap-4', 'lg:gap-6'],
	});
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
