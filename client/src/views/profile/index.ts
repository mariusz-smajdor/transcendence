import { CloudUpload, UserCog, X } from 'lucide';
import { Wrapper } from '../../components/wrapper';
import { Card } from '../../components/card';
import { Icon } from '../../components/icon';
import { Heading } from '../../components/heading';
import { Label } from '../../components/label';
import { Input } from '../../components/input';
import { store } from '../../store';
import { Text } from '../../components/text';
import { Img } from '../../components/img';
import { Button } from '../../components/button';

export default function Profile() {
	const user = store.getState().user;

	const overlay = Wrapper({
		element: 'section',
		classes: [
			'fixed',
			'inset-0',
			'bg-black/50',
			'flex',
			'items-center',
			'justify-center',
			'z-50',
		],
	});

	const closeModal = () => {
		overlay.remove();
		document.removeEventListener('keydown', onKeyDown);
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			closeModal();
		}
	};

	document.addEventListener('keydown', onKeyDown);

	function Form() {
		const form = Wrapper({
			element: 'form',
			method: 'POST',
			classes: ['flex', 'flex-col', 'gap-6'],
		}) as HTMLFormElement;
		const avatarLabel = Label({
			classes: ['flex', 'items-center', 'gap-4', 'cursor-pointer'],
		});
		const avatarImg = Img({
			src: user?.avatar || `https://i.pravatar.cc/150?u=${user?.id}`,
			alt: 'Avatar',
			width: 48,
			height: 48,
			classes: ['rounded-full', 'border', 'border-accent'],
		});
		const avatarInput = Input({
			type: 'file',
			name: 'avatar',
			id: 'avatar',
			classes: ['hidden'],
		});
		const uploadText = Text({
			content: 'Change avatar',
			classes: [
				'text-sm',
				'text-secondary',
				'font-medium',
				'border',
				'rounded-full',
				'px-4',
				'py-2',
				'flex',
				'gap-2',
				'items-center',
			],
		});
		const uploadIcon = Icon({
			icon: CloudUpload,
			size: 'lg',
			strokeWidth: 1.2,
		});
		const grid = Wrapper({
			classes: ['grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-6'],
		});
		const usernameLabel = Label({
			content: 'Username:',
			classes: ['flex', 'flex-col', 'gap-2'],
		});
		const usernameInput = Input({
			type: 'text',
			name: 'username',
			id: 'username',
			placeholder: user?.username || 'Username',
			classes: ['flex-1'],
		});
		const emailLabel = Label({
			content: 'Email:',
			classes: ['flex', 'flex-col', 'gap-2'],
		});
		const emailInput = Input({
			type: 'email',
			name: 'email',
			id: 'email',
			placeholder: user?.email || 'you@example.com',
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
		});
		const submitWrapper = Wrapper({
			classes: ['flex', 'items-end', 'justify-start', 'md:justify-end'],
		});
		const submitBtn = Button({
			type: 'submit',
			content: 'Save changes',
			classes: ['flex-1'],
		});
		uploadText.prepend(uploadIcon);
		avatarLabel.appendChild(avatarImg);
		avatarLabel.appendChild(uploadText);
		avatarLabel.appendChild(avatarInput);
		usernameLabel.appendChild(usernameInput);
		emailLabel.appendChild(emailInput);
		passwordLabel.appendChild(passwordInput);
		submitWrapper.appendChild(submitBtn);

		grid.appendChild(usernameLabel);
		grid.appendChild(emailLabel);
		grid.appendChild(passwordLabel);
		grid.appendChild(submitWrapper);

		form.appendChild(avatarLabel);
		form.appendChild(grid);

		avatarInput.addEventListener('change', (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (file) avatarImg.src = URL.createObjectURL(file);
		});
		form.addEventListener('submit', (e) => {
			e.preventDefault();

			const data = {
				username: usernameInput.value.trim() || null,
				email: emailInput.value.trim() || null,
				password: passwordInput.value || null,
				avatar: avatarInput.files?.[0] || null,
			};

			console.log('Prepared form data:', data);
		});

		return form;
	}

	function ProfileCard() {
		const card = Card({
			classes: [
				'flex',
				'flex-col',
				'gap-4',
				'p-6',
				'bg-background',
				'rounded-2xl',
				'shadow-xl',
				'w-150',
			],
		});
		const header = Wrapper({
			classes: ['flex', 'justify-between', 'items-center'],
		});
		const titleContainer = Wrapper({
			classes: ['flex', 'items-center', 'gap-2'],
		});
		const titleIcon = Icon({
			icon: UserCog,
			size: 'lg',
			classes: ['glow-secondary-animate'],
		});
		const titleContent = Heading({
			level: 2,
			classes: ['text-2xl', 'font-bold', 'text-center'],
			content: 'Edit Your Profile',
		});
		const closeBtn = Icon({
			icon: X,
			classes: [
				'cursor-pointer',
				'text-muted',
				'hover:text-primary',
				'transition-colors',
				'duration-300',
			],
		});
		const separator = Wrapper({
			classes: ['flex', 'items-center', 'gap-2', 'w-full'],
		});
		const line = Wrapper({ classes: ['h-px', 'flex-1', 'bg-accent'] });

		closeBtn.addEventListener('click', closeModal);

		separator.appendChild(line);
		titleContainer.appendChild(titleIcon);
		titleContainer.appendChild(titleContent);
		header.appendChild(titleContainer);
		header.appendChild(closeBtn);
		card.appendChild(header);
		card.appendChild(separator);
		card.appendChild(Form());

		return card;
	}

	overlay.appendChild(ProfileCard());
	return overlay;
}
