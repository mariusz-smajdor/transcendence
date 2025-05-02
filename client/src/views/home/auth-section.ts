import { KeyRound } from 'lucide';
import Login from './login';
import { Card } from '../../components/card';
import { Heading } from '../../components/heading';
import { Icon } from '../../components/icon';
import { Tabs, Trigger } from '../../components/tabs';
import { Wrapper } from '../../components/wrapper';

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
			tabs: [Login(), Wrapper({})],
			classes: ['h-full'],
		})
	);
	return section;
}
