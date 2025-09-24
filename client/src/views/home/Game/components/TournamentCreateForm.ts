import { Card } from '../../../../components/card';
import { getCookie } from '../../../game/game-cookies.js';
import { showPopupMessage } from '../../../../utils/tournamentUtils.js';

interface TournamentCreateFormProps {
	onCancel: () => void;
	onCreate: (numberOfPlayers: number) => void;
}

export function TournamentCreateForm({
	onCancel,
	onCreate,
}: TournamentCreateFormProps) {
	const card = Card({
		classes: [
			'flex',
			'flex-col',
			'gap-4',
			'bg-background',
			'lg:gap-6',
			'overflow-y-auto',
			'max-h-160',
		],
	});
	card.classList.remove('bg-foreground');

	const formWrapper = document.createElement('div');
	formWrapper.classList.add(
		'flex',
		'flex-col',
		'gap-4',
		'items-center',
		'justify-center',
		'py-8'
	);

	const title = document.createElement('div');
	title.textContent = 'Select number of players';
	title.classList.add('font-bold', 'mb-2');

	const token = getCookie('access_token') ?? null;
	const sessionId = getCookie('sessionId') ?? null;
	const isLoggedIn = !!token && !!sessionId;

	let nicknameInput: HTMLInputElement | null = null;

	if (!isLoggedIn) {
		const nicknameWrapper = document.createElement('div');
		nicknameWrapper.classList.add(
			'flex',
			'flex-col',
			'gap-2',
			'w-full',
			'max-w-md'
		);

		const nicknameLabel = document.createElement('label');
		nicknameLabel.textContent = 'Enter your nickname:';
		nicknameLabel.classList.add('text-sm', 'font-medium');

		nicknameInput = document.createElement('input');
		nicknameInput.type = 'text';
		nicknameInput.placeholder = 'Nickname';
		nicknameInput.classList.add('border', 'rounded', 'p-2', 'w-full');
		nicknameInput.maxLength = 20;

		nicknameWrapper.appendChild(nicknameLabel);
		nicknameWrapper.appendChild(nicknameInput);
		formWrapper.appendChild(nicknameWrapper);
	}

	const select = document.createElement('select');
	select.classList.add('border', 'rounded', 'p-2');
	[4, 8].forEach((num) => {
		const option = document.createElement('option');
		option.value = num.toString();
		option.textContent = num.toString();
		select.appendChild(option);
	});

	const buttons = document.createElement('div');
	buttons.classList.add('flex', 'gap-2', 'justify-end');

	const confirmBtn = document.createElement('button');
	confirmBtn.textContent = 'Create';
	confirmBtn.classList.add('btn', 'btn-primary', 'px-4', 'py-2');

	const cancelBtn = document.createElement('button');
	cancelBtn.textContent = 'Cancel';
	cancelBtn.classList.add('btn', 'btn-secondary', 'px-4', 'py-2');

	buttons.appendChild(confirmBtn);
	buttons.appendChild(cancelBtn);

	formWrapper.appendChild(title);
	formWrapper.appendChild(select);
	formWrapper.appendChild(buttons);
	card.appendChild(formWrapper);

	cancelBtn.onclick = onCancel;

	confirmBtn.onclick = async () => {
		try {
			let creator = 'Player';
			if (!isLoggedIn) {
				const nickname = nicknameInput?.value.trim();
				if (!nickname) {
					nicknameInput?.classList.add('border-red-500');
					nicknameInput?.focus();
					return;
				}
				creator = nickname;
			}

			const numberOfPlayers = parseInt(select.value, 10);
			const response = await fetch('http://localhost:3000/tournament/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					creator,
					token,
					sessionId,
					numberOfPlayers,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				showPopupMessage(errorData.error || 'Failed to create tournament');
				return;
			}

			await response.json();
			showPopupMessage('Tournament created successfully!');
			onCreate(numberOfPlayers);
		} catch (error) {
			console.error('Error creating tournament:', error);
			showPopupMessage('Network error. Please try again.');
		}
	};

	return card;
}
