import { Button } from '../../../components/button';
import { Heading } from '../../../components/heading';
import { Input } from '../../../components/input';
import { Label } from '../../../components/label';
import { Tab } from '../../../components/tabs';
import { Text } from '../../../components/text';
import { Wrapper } from '../../../components/wrapper';
import { t } from '../../../services/i18n';
import { onLanguageChange } from '../../../services/languageService';

function loginUser(
	form: HTMLFormElement,
	usernameInput: HTMLInputElement,
	passwordInput: HTMLInputElement,
	totpInput?: HTMLInputElement
) {
	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		if (form.lastChild instanceof HTMLSpanElement) {
			form.removeChild(form.lastChild);
		}

		const submitMessage = Text({
			content: '',
			classes: ['text-red-400', 'text-xs'],
		});

		const loginData = {
			username: usernameInput.value,
			password: passwordInput.value,
			totpToken: totpInput?.value || undefined,
		};

		try {
			const res = await fetch('/api/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(loginData),
				credentials: 'include',
			});

			const data = await res.json();

			if (!data.success) {
				if (data.requires2FA) {
					// 2FA is required
					submitMessage.textContent = t('login.2fa.prompt');
					submitMessage.classList.remove('text-red-400');
					submitMessage.classList.add('text-blue-400');
				} else {
					submitMessage.textContent = data.message;
				}
				form.appendChild(submitMessage);
			} else {
				submitMessage.textContent = t('login.success');
				submitMessage.classList.remove('text-red-400');
				submitMessage.classList.add('text-green-400');
				form.appendChild(submitMessage);
				usernameInput.value = '';
				passwordInput.value = '';
				if (totpInput) totpInput.value = '';

				window.location.reload();
			}
		} catch (error) {
			if (error instanceof Error) {
				submitMessage.textContent = error.message;
			} else {
				submitMessage.textContent = t('login.unknownError');
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
		content: t('login.heading'),
		classes: ['text-[1rem]', 'text-center'],
	});
	const form = Wrapper({
		element: 'form',
		method: 'POST',
		classes: ['flex', 'flex-col', 'gap-4', 'lg:gap-6'],
	}) as HTMLFormElement;

	// Username field
	const usernameLabel = Label({
		content: t('login.username.label'),
		classes: ['flex', 'flex-col', 'gap-2'],
	});
	const usernameInput = Input({
		type: 'text',
		name: 'username',
		id: 'username',
		placeholder: t('login.username.placeholder'),
		required: true,
	});

	// Password field
	const passwordLabel = Label({
		content: t('login.password.label'),
		classes: ['flex', 'flex-col', 'gap-2'],
	});
	const passwordInput = Input({
		type: 'password',
		name: 'password',
		id: 'password',
		placeholder: t('login.password.placeholder'),
		required: true,
	});

	// 2FA field
	const totpLabel = Label({
		content: t('login.totp.label'),
		classes: ['flex', 'flex-col', 'gap-2'],
	});
	const totpInput = Input({
		type: 'text',
		name: 'totp',
		id: 'totp',
		placeholder: t('login.totp.placeholder'),
		required: false,
	});

	// Show 2FA field by default
	totpInput.style.display = 'block';
	totpLabel.style.display = 'block';

	loginUser(form, usernameInput, passwordInput, totpInput);

	usernameLabel.appendChild(usernameInput);
	passwordLabel.appendChild(passwordInput);
	totpLabel.appendChild(totpInput);

	form.appendChild(usernameLabel);
	form.appendChild(passwordLabel);
	form.appendChild(totpLabel);
	
	const submitButton = Button({ content: t('login.submit'), type: 'submit' });
	submitButton.setAttribute('data-i18n', 'login.submit');
	form.appendChild(submitButton);

	tab.appendChild(heading);
	tab.appendChild(form);

	// Add language change listener
	onLanguageChange(() => {
		// Update heading
		heading.textContent = t('login.heading');
		
		// Update labels
		usernameLabel.firstChild!.textContent = t('login.username.label');
		passwordLabel.firstChild!.textContent = t('login.password.label');
		totpLabel.firstChild!.textContent = t('login.totp.label');
		
		// Update placeholders
		usernameInput.placeholder = t('login.username.placeholder');
		passwordInput.placeholder = t('login.password.placeholder');
		totpInput.placeholder = t('login.totp.placeholder');
		
		// Update submit button
		submitButton.textContent = t('login.submit');
	});

	return tab;
}
