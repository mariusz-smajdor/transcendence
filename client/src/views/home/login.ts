import { Button } from '../../components/button';
import { Heading } from '../../components/heading';
import { Img } from '../../components/img';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import { Separator } from '../../components/separator';
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
		classes: ['flex', 'flex-col', 'gap-4', 'h-full', 'lg:gap-6'],
	});
	const emailLabel = Label({
		content: 'Enter your email:',
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
		content: 'Enter your password:',
		classes: ['flex', 'flex-col', 'gap-2'],
	});
	const passwordInput = Input({
		type: 'password',
		name: 'password',
		id: 'password',
		placeholder: '********',
		required: true,
	});
	const googleButton = Button({
		content: 'Authenticate with Google',
		variant: 'outline',
		classes: [
			'flex',
			'flex-row-reverse',
			'gap-2',
			'items-center',
			'justify-center',
		],
	});
	const googleLogo = Img({
		src: 'google-logo.svg',
		alt: 'Google logo',
		width: 18,
		height: 18,
	});
	googleButton.appendChild(googleLogo);

	emailLabel.appendChild(emailInput);
	passwordLabel.appendChild(passwordInput);
	form.appendChild(emailLabel);
	form.appendChild(passwordLabel);
	form.appendChild(Button({ content: 'Login', type: 'submit' }));
	tab.appendChild(heading);
	tab.appendChild(form);
	tab.appendChild(Separator());
	tab.appendChild(googleButton);

	return tab;
}
