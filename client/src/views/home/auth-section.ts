import { KeyRound } from 'lucide';
import { Card } from '../../components/card';
import { Tabs, Trigger } from '../../components/tabs';
import { Heading } from '../../components/heading';
import { Icon } from '../../components/icon';
import { Button } from '../../components/button';
import { Img } from '../../components/img';
import { Separator } from '../../components/separator';
import Login from './login';
import Register from './register';

export default function AuthSection() {
	const section = Card({
		element: 'section',
		classes: ['flex', 'flex-col', 'gap-4', 'lg:col-span-2', 'lg:gap-6'],
	});
	const heading = Heading({
		level: 2,
		content: 'Authenticate',
		classes: ['flex', 'items-center', 'gap-2'],
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

	heading.prepend(
		Icon({
			icon: KeyRound,
			size: 'lg',
			classes: ['text-secondary', 'glow-secondary-animate'],
		})
	);
	section.appendChild(heading);

	section.appendChild(
		Tabs({
			defaultValue: 'login',
			triggers: [
				Trigger({ content: 'Login', value: 'login' }),
				Trigger({ content: 'Register', value: 'register' }),
			],
			tabs: [Login(), Register()],
		})
	);

	section.appendChild(Separator());
	section.appendChild(googleButton);
	return section;
}
