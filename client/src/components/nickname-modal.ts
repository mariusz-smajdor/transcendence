import { Button } from './button';
import { Input } from './input';
import { Heading } from './heading';
import { Text } from './text';
import { Wrapper } from './wrapper';

type NicknameModalOptions = {
	title: string;
	description: string;
	placeholder?: string;
	onConfirm: (nickname: string) => void;
	onCancel?: () => void;
};

export function showNicknameModal({
	title,
	description,
	placeholder = 'Enter your nickname',
	onConfirm,
	onCancel,
}: NicknameModalOptions): void {
	const overlay = document.createElement('div');
	overlay.classList.add(
		'fixed',
		'inset-0',
		'bg-black/70',
		'flex',
		'items-center',
		'justify-center',
		'z-50'
	);
	overlay.id = 'nickname-modal';

	const modal = Wrapper({
		classes: [
			'bg-background',
			'rounded-lg',
			'p-6',
			'max-w-md',
			'w-full',
			'mx-4',
			'border',
			'border-accent',
		],
	});

	const heading = Heading({
		level: 2,
		content: title,
		classes: ['text-xl', 'mb-2'],
	});

	const desc = Text({
		element: 'p',
		content: description,
		classes: ['text-muted', 'mb-4'],
	});

	const input = Input({
		type: 'text',
		placeholder,
		name: 'nickname',
		classes: ['w-full', 'mb-4'],
	});

	// Error message element
	const errorMsg = Text({
		element: 'p',
		content: '',
		classes: ['text-red-400', 'text-sm', 'mb-2', 'hidden'],
	});

	const buttonsWrapper = Wrapper({
		classes: ['flex', 'gap-2', 'justify-end'],
	});

	const cancelBtn = Button({
		variant: 'outline',
		content: 'Cancel',
		classes: ['flex-1'],
	});

	const confirmBtn = Button({
		variant: 'primary',
		content: 'Confirm',
		classes: ['flex-1'],
	});

	const showError = (message: string) => {
		errorMsg.textContent = message;
		errorMsg.classList.remove('hidden');
		input.classList.add('border-red-400');
	};

	const hideError = () => {
		errorMsg.textContent = '';
		errorMsg.classList.add('hidden');
		input.classList.remove('border-red-400');
	};

	const validateNickname = (nickname: string): boolean => {
		hideError();

		if (!nickname.trim()) {
			showError('Nickname cannot be empty');
			return false;
		}

		if (nickname.trim().length < 2) {
			showError('Nickname must be at least 2 characters');
			return false;
		}

		if (nickname.trim().length > 20) {
			showError('Nickname must be less than 20 characters');
			return false;
		}

		// Allow letters, numbers, spaces, underscores, and hyphens
		const validPattern = /^[a-zA-Z0-9 _-]+$/;
		if (!validPattern.test(nickname.trim())) {
			showError('Nickname can only contain letters, numbers, spaces, _ and -');
			return false;
		}

		return true;
	};

	const closeModal = () => {
		overlay.remove();
	};

	cancelBtn.addEventListener('click', () => {
		closeModal();
		if (onCancel) onCancel();
	});

	confirmBtn.addEventListener('click', () => {
		const nickname = input.value.trim();
		if (validateNickname(nickname)) {
			closeModal();
			onConfirm(nickname);
		}
	});

	// Allow Enter key to submit
	input.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') {
			const nickname = input.value.trim();
			if (validateNickname(nickname)) {
				closeModal();
				onConfirm(nickname);
			}
		}
	});

	// Clear error on input
	input.addEventListener('input', () => {
		hideError();
	});

	// Close on overlay click
	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) {
			closeModal();
			if (onCancel) onCancel();
		}
	});

	// Close on Escape key
	const handleEscape = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			closeModal();
			if (onCancel) onCancel();
			window.removeEventListener('keydown', handleEscape);
		}
	};
	window.addEventListener('keydown', handleEscape);

	buttonsWrapper.appendChild(cancelBtn);
	buttonsWrapper.appendChild(confirmBtn);

	modal.appendChild(heading);
	modal.appendChild(desc);
	modal.appendChild(input);
	modal.appendChild(errorMsg);
	modal.appendChild(buttonsWrapper);

	overlay.appendChild(modal);
	document.body.appendChild(overlay);

	// Focus input
	setTimeout(() => input.focus(), 100);
}
