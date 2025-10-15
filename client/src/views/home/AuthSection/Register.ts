import { Button } from '../../../components/button';
import { Heading } from '../../../components/heading';
import { Input } from '../../../components/input';
import { Label } from '../../../components/label';
import { Tab } from '../../../components/tabs';
import { Text } from '../../../components/text';
import { Wrapper } from '../../../components/wrapper';
import { t } from '../../../services/i18n';

function registerUser(
	form: HTMLFormElement,
	emailInput: HTMLInputElement,
	usernameInput: HTMLInputElement,
	passwordInput: HTMLInputElement,
	confirmPasswordInput: HTMLInputElement,
	qrCodeContainer?: HTMLElement
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

		const registerData = {
			email: emailInput.value,
			username: usernameInput.value,
			password: passwordInput.value,
			confirmPassword: confirmPasswordInput.value,
		};

		try {
			const res = await fetch('/api/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					...registerData,
				}),
			});

			const data = await res.json();
			if (!data.success) {
				submitMessage.textContent = data.message;
				form.appendChild(submitMessage);
			} else {
				submitMessage.textContent = t('register.success');
				submitMessage.classList.remove('text-red-400');
				submitMessage.classList.add('text-green-400');
				form.appendChild(submitMessage);

				// Show QR code if available
				if (data.qrCode && qrCodeContainer) {
					const qrImg = document.createElement('img');
					qrImg.src = data.qrCode;
					qrImg.alt = t('register.qr.alt');
					qrImg.className = 'mx-auto mt-4 max-w-xs';
					qrCodeContainer.innerHTML = '';
					qrCodeContainer.appendChild(qrImg);
					qrCodeContainer.style.display = 'block';
				}

				emailInput.value = '';
				usernameInput.value = '';
				passwordInput.value = '';
				confirmPasswordInput.value = '';
			}
		} catch (error) {
			if (error instanceof Error) {
				submitMessage.textContent = error.message;
			} else {
				submitMessage.textContent =
					'An unknown error occurred. Please try again.';
			}
			form.appendChild(submitMessage);
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
		content: t('register.heading'),
		classes: ['text-[1rem]', 'text-center'],
	});
	const form = Wrapper({
		element: 'form',
		method: 'POST',
		classes: ['flex', 'flex-col', 'gap-4', 'lg:gap-6'],
	}) as HTMLFormElement;
	const emailLabel = Label({
		content: t('register.email.label'),
		classes: ['flex', 'flex-col', 'gap-2'],
	});
	const emailInput = Input({
		type: 'email',
		name: 'set-email',
		id: 'set-email',
		placeholder: t('register.email.placeholder'),
		required: true,
	});
	const usernameLabel = Label({
		content: t('register.username.label'),
		classes: ['flex', 'flex-col', 'gap-2'],
	});
	const usernameInput = Input({
		type: 'text',
		name: 'set-username',
		id: 'set-username',
		placeholder: t('register.username.placeholder'),
		required: true,
	});
	const passwordLabel = Label({
		content: t('register.password.label'),
		classes: ['flex', 'flex-col', 'gap-2'],
	});
	const passwordInput = Input({
		type: 'password',
		name: 'set-password',
		id: 'set-password',
		placeholder: t('register.password.placeholder'),
		required: true,
	});
	const confirmPasswordLabel = Label({
		content: t('register.confirmPassword.label'),
		classes: ['flex', 'flex-col', 'gap-2'],
	});
	const confirmPasswordInput = Input({
		type: 'password',
		name: 'set-confirm-password',
		id: 'set-confirm-password',
		placeholder: t('register.confirmPassword.placeholder'),
		required: true,
	});

	// QR Code container (initially hidden)
	const qrCodeContainer = document.createElement('div');
	qrCodeContainer.className = 'text-center';
	qrCodeContainer.style.display = 'none';

	registerUser(
		form,
		emailInput,
		usernameInput,
		passwordInput,
		confirmPasswordInput,
		qrCodeContainer
	);

	emailLabel.appendChild(emailInput);
	usernameLabel.appendChild(usernameInput);
	passwordLabel.appendChild(passwordInput);
	confirmPasswordLabel.appendChild(confirmPasswordInput);
	form.appendChild(emailLabel);
	form.appendChild(usernameLabel);
	form.appendChild(passwordLabel);
	form.appendChild(confirmPasswordLabel);
	form.appendChild(qrCodeContainer);
	form.appendChild(Button({ content: t('register.submit'), type: 'submit' }));
	tab.appendChild(heading);
	tab.appendChild(form);

	return tab;
}
