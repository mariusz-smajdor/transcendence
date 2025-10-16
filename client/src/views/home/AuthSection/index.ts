import { KeyRound } from 'lucide';
import { t } from '../../../services/i18n';
import { Card } from '../../../components/card';
import { Tabs, Trigger } from '../../../components/tabs';
import { Heading } from '../../../components/heading';
import { Icon } from '../../../components/icon';
import { Button } from '../../../components/button';
import { Img } from '../../../components/img';
import { Separator } from '../../../components/separator';
import Login from './Login';
import Register from './Register';
import { store } from '../../../store';

export default function Auth() {
	const section = Card({
		element: 'section',
		classes: ['flex', 'flex-col', 'gap-4', 'lg:col-span-2', 'lg:gap-6'],
	});
	const heading = Heading({
		level: 2,
		content: t('auth.authenticate'),
		classes: ['flex', 'items-center', 'gap-2'],
	});
	heading.setAttribute('data-i18n', 'auth.authenticate');
	const googleButton = Button({
		content: t('auth.google'),
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
		alt: t('auth.google'),
		width: 18,
		height: 18,
	});
	googleButton.setAttribute('data-i18n', 'auth.google');
	googleLogo.setAttribute('data-i18n-alt', 'auth.google');
	googleButton.appendChild(googleLogo);
	googleButton.addEventListener('click', () => {
		const api_url = store.getState().api_url;
		window.location.href = `${api_url}/login/google`;
	});

	heading.prepend(
		Icon({
			icon: KeyRound,
			size: 'lg',
			classes: ['text-secondary', 'glow-secondary-animate'],
		})
	);
	section.appendChild(heading);

	const loginTrigger = Trigger({
		content: t('auth.tabs.login'),
		value: 'login',
	});
	loginTrigger.setAttribute('data-i18n', 'auth.tabs.login');
	const registerTrigger = Trigger({
		content: t('auth.tabs.register'),
		value: 'register',
	});
	registerTrigger.setAttribute('data-i18n', 'auth.tabs.register');

	section.appendChild(
		Tabs({
			defaultValue: 'login',
			triggers: [loginTrigger, registerTrigger],
			tabs: [Login(), Register()],
		})
	);

	section.appendChild(Separator());
	section.appendChild(googleButton);

	return section;
}
