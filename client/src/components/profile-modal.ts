import { Wrapper } from './wrapper';
import { Card } from './card';
import { Icon } from './icon';
import { Heading } from './heading';
import { Img } from './img';
import { Text } from './text';
import { Button } from './button';
import {
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableHeaderCell,
	TableRow,
} from './table';
import { CloudUpload, History, Settings, User, Mail, X } from 'lucide';
import { store } from '../store';
import { getAvatarUrl } from '../utils/avatarUtils';
import { historyManager } from '../utils/historyManager';
import {
	fetchFriendMatchHistory,
	type MatchResult,
	type MatchStats,
} from '../api/matchResults';
import { getFriends, getFriendRequests } from '../api/friendRequest';
import { Toaster } from './toaster';
import { Input } from './input';
import { Label } from './label';

type ProfileModalOptions =
	| { mode: 'self'; pushState?: boolean }
	| { mode: 'friend'; friendId: number; pushState?: boolean };

export function ProfileModal(options: ProfileModalOptions) {
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
			'p-4',
		],
	});

	// Identify by mode for duplicate guards
	if (options.mode === 'friend')
		overlay.setAttribute('data-friend-profile-modal', 'true');
	else overlay.setAttribute('data-profile-modal', 'true');

	const closeModal = () => {
		overlay.remove();
		document.removeEventListener('keydown', onKeyDown);
		window.removeEventListener('popstate', onPopState);

		historyManager.back();
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') closeModal();
	};
	const onPopState = () => {
		overlay.remove();
		document.removeEventListener('keydown', onKeyDown);
		window.removeEventListener('popstate', onPopState);
	};

	document.addEventListener('keydown', onKeyDown);
	window.addEventListener('popstate', onPopState);

	// Push modal state for history navigation
	if (options.pushState !== false) {
		if (options.mode === 'friend')
			historyManager.pushState('modal', {
				modal: 'friendProfile',
				friendId: options.friendId,
			});
		else historyManager.pushState('modal', { modal: 'profile' });
	}

	function ProfileHeaderSelf() {
		const user = store.getState().user;
		const headerCard = Card({
			classes: [
				'flex',
				'flex-col',
				'md:flex-row',
				'items-center',
				'gap-6',
				'p-8',
				'bg-background',
				'rounded-2xl',
				'shadow-xl',
			],
		});

		const avatarSection = Wrapper({
			classes: ['flex', 'flex-col', 'items-center', 'gap-4'],
		});
		const avatarImg = Img({
			src: getAvatarUrl(user?.avatar, user?.username || 'User'),
			alt: 'Avatar',
			width: 120,
			height: 120,
			classes: ['rounded-full', 'border-4', 'border-accent', 'aspect-square'],
		});

		const userInfo = Wrapper({
			classes: [
				'flex',
				'flex-col',
				'items-center',
				'md:items-start',
				'gap-2',
				'flex-1',
			],
		});
		const usernameDisplay = Heading({
			level: 1,
			content: user?.username || 'User',
			classes: ['text-3xl', 'font-bold', 'text-primary'],
		});
		const emailDisplay = Wrapper({
			classes: ['flex', 'items-center', 'gap-2', 'text-muted'],
		});
		const emailIcon = Icon({ icon: Mail, size: 'sm' });
		const emailText = Text({
			content: user?.email || 'No email',
			classes: ['text-lg'],
		});
		emailDisplay.appendChild(emailIcon);
		emailDisplay.appendChild(emailText);

		const statsSection = Wrapper({ classes: ['flex', 'gap-6', 'mt-4'] });
		const statsContainer = Wrapper({ classes: ['flex', 'gap-6'] });

		const actionButtons = Wrapper({ classes: ['flex', 'gap-4', 'mt-6'] });
		const settingsBtn = Button({
			content: 'Settings',
			variant: 'outline',
			classes: [
				'flex',
				'items-center',
				'gap-2',
				'border-primary',
				'text-primary',
				'hover:bg-primary',
				'hover:text-white',
				'transition-colors',
			],
		});
		const settingsIcon = Icon({ icon: Settings, size: 'sm' });
		settingsBtn.prepend(settingsIcon);
		settingsBtn.addEventListener('click', () => showSettingsModal());

		avatarSection.appendChild(avatarImg);
		userInfo.appendChild(usernameDisplay);
		userInfo.appendChild(emailDisplay);
		userInfo.appendChild(statsSection);
		statsSection.appendChild(statsContainer);
		actionButtons.appendChild(settingsBtn);
		userInfo.appendChild(actionButtons);

		headerCard.appendChild(avatarSection);
		headerCard.appendChild(userInfo);

		loadUserStats(statsContainer);
		return headerCard;
	}

	async function loadUserStats(container: HTMLElement) {
		try {
			const stats = await (
				await import('../api/matchResults')
			).fetchMatchStats();
			const statItems = [
				{
					label: 'Total Matches',
					value: stats.totalMatches,
					color: 'text-primary',
				},
				{ label: 'Wins', value: stats.wins, color: 'text-green-400' },
				{ label: 'Losses', value: stats.losses, color: 'text-red-400' },
				{
					label: 'Win Rate',
					value: `${stats.winRate}%`,
					color: 'text-blue-400',
				},
			];
			statItems.forEach((stat) => {
				const statDiv = document.createElement('div');
				statDiv.className =
					'text-center p-4 bg-primary/10 rounded-lg min-w-[100px]';
				const valueDiv = document.createElement('div');
				valueDiv.className = `text-2xl font-bold ${stat.color}`;
				valueDiv.textContent = stat.value.toString();
				const labelDiv = document.createElement('div');
				labelDiv.className = 'text-sm text-muted mt-1';
				labelDiv.textContent = stat.label;
				statDiv.appendChild(valueDiv);
				statDiv.appendChild(labelDiv);
				container.appendChild(statDiv);
			});
		} catch (error) {
			console.error('Error loading user stats:', error);
			const errorDiv = document.createElement('div');
			errorDiv.className = 'text-red-400 text-sm';
			errorDiv.textContent = 'Failed to load stats';
			container.appendChild(errorDiv);
		}
	}

	function ProfileHeaderFriend(friend: any, stats: MatchStats | null) {
		const headerCard = Card({
			classes: [
				'flex',
				'flex-col',
				'md:flex-row',
				'items-center',
				'gap-6',
				'p-8',
				'bg-background',
				'rounded-2xl',
				'shadow-xl',
			],
		});
		const avatarSection = Wrapper({
			classes: ['flex', 'flex-col', 'items-center', 'gap-4'],
		});
		const avatarImg = Img({
			src: getAvatarUrl(friend.avatar, friend.username),
			alt: 'Friend Avatar',
			width: 120,
			height: 120,
			classes: ['rounded-full', 'border-4', 'border-accent', 'aspect-square'],
		});
		const userInfo = Wrapper({
			classes: [
				'flex',
				'flex-col',
				'items-center',
				'md:items-start',
				'gap-2',
				'flex-1',
			],
		});
		const usernameDisplay = Heading({
			level: 1,
			content: friend.username,
			classes: ['text-3xl', 'font-bold', 'text-primary'],
		});
		const emailDisplay = Wrapper({
			classes: ['flex', 'items-center', 'gap-2', 'text-muted'],
		});
		const emailIcon = Icon({ icon: Mail, size: 'sm' });
		const emailText = Text({
			content: friend.email || 'No email',
			classes: ['text-lg'],
		});
		emailDisplay.appendChild(emailIcon);
		emailDisplay.appendChild(emailText);
		const statsSection = Wrapper({ classes: ['flex', 'gap-6', 'mt-4'] });
		const statsContainer = Wrapper({ classes: ['flex', 'gap-6'] });

		avatarSection.appendChild(avatarImg);
		userInfo.appendChild(usernameDisplay);
		userInfo.appendChild(emailDisplay);
		userInfo.appendChild(statsSection);
		statsSection.appendChild(statsContainer);
		headerCard.appendChild(avatarSection);
		headerCard.appendChild(userInfo);

		if (stats) loadFriendStats(statsContainer, stats);
		else {
			const noStatsDiv = document.createElement('div');
			noStatsDiv.className = 'text-muted text-sm';
			noStatsDiv.textContent = 'No match statistics available';
			statsContainer.appendChild(noStatsDiv);
		}
		return headerCard;
	}

	function loadFriendStats(container: HTMLElement, stats: MatchStats) {
		const statItems = [
			{
				label: 'Total Matches',
				value: stats.totalMatches,
				color: 'text-primary',
			},
			{ label: 'Wins', value: stats.wins, color: 'text-green-400' },
			{ label: 'Losses', value: stats.losses, color: 'text-red-400' },
			{ label: 'Win Rate', value: `${stats.winRate}%`, color: 'text-blue-400' },
		];
		statItems.forEach((stat) => {
			const statDiv = document.createElement('div');
			statDiv.className =
				'text-center p-4 bg-primary/10 rounded-lg min-w-[100px]';
			const valueDiv = document.createElement('div');
			valueDiv.className = `text-2xl font-bold ${stat.color}`;
			valueDiv.textContent = stat.value.toString();
			const labelDiv = document.createElement('div');
			labelDiv.className = 'text-sm text-muted mt-1';
			labelDiv.textContent = stat.label;
			statDiv.appendChild(valueDiv);
			statDiv.appendChild(labelDiv);
			container.appendChild(statDiv);
		});
	}

	function createGameHistoryTable(matches: MatchResult[], winnerName: string) {
		const table = Table({});
		const tableHeader = TableHeader({});
		const headerRow = TableRow({});
		const opponentHeader = TableHeaderCell({ content: 'Opponent' });
		const scoreHeader = TableHeaderCell({ content: 'Score' });
		const typeHeader = TableHeaderCell({ content: 'Type' });
		const dateHeader = TableHeaderCell({ content: 'Date' });
		const blockchainHeader = TableHeaderCell({ content: 'Blockchain' });
		const tableBody = TableBody({});

		matches.forEach((match: MatchResult) => {
			const row = TableRow({});
			const opponentCell = TableCell({
				content: match.gameType === 'CPU' ? 'CPU' : match.opponent.username,
				classes: ['flex', 'items-center', 'gap-2'],
			});
			opponentCell.prepend(
				Img({
					src: getAvatarUrl(
						match.opponent.avatar,
						match.gameType === 'CPU' ? 'CPU' : match.opponent.username
					),
					classes: ['w-8', 'h-8', 'rounded-full', 'border', 'border-accent'],
					alt: 'Opponent avatar',
					loading: 'lazy',
				})
			);
			const scoreCell =
				match.winner === winnerName
					? TableCell({ content: match.score, classes: ['text-green-400'] })
					: TableCell({
							content: match.score.split(' - ').reverse().join(' - '),
							classes: ['text-red-400'],
					  });
			const typeSpan = Text({
				element: 'span',
				content: match.gameType,
				classes: [
					'text-xs',
					'text-primary',
					'bg-primary/25',
					'py-1',
					'px-2',
					'rounded-full',
				],
			});
			const typeCell = TableCell({});
			typeCell.appendChild(typeSpan);
			const dateCell = TableCell({
				content: new Date(match.date).toLocaleDateString(),
				classes: ['text-muted'],
			});
			const blockchainCell = TableCell({
				content: match.blockchainTx ? '✓' : '✗',
				classes: [match.blockchainTx ? 'text-green-400' : 'text-red-400'],
			});
			row.appendChild(opponentCell);
			row.appendChild(scoreCell);
			row.appendChild(typeCell);
			row.appendChild(dateCell);
			row.appendChild(blockchainCell);
			tableBody.appendChild(row);
		});

		headerRow.appendChild(opponentHeader);
		headerRow.appendChild(scoreHeader);
		headerRow.appendChild(typeHeader);
		headerRow.appendChild(dateHeader);
		headerRow.appendChild(blockchainHeader);
		tableHeader.appendChild(headerRow);
		table.appendChild(tableHeader);
		table.appendChild(tableBody);
		return table;
	}

	function ProfileContentSelf() {
		const modalContainer = Wrapper({
			classes: [
				'bg-foreground',
				'rounded-2xl',
				'shadow-2xl',
				'max-w-4xl',
				'w-full',
				'max-h-[90vh]',
				'overflow-y-auto',
			],
		});
		const header = document.createElement('div');
		header.className =
			'flex items-center justify-between p-6 border-b border-accent';
		const titleContainer = Wrapper({
			classes: ['flex', 'items-center', 'gap-3'],
		});
		const titleIcon = Icon({
			icon: User,
			size: 'lg',
			classes: ['text-primary', 'glow-primary-animate'],
		});
		const titleElement = Heading({
			level: 2,
			content: 'Profile',
			classes: ['text-2xl', 'font-bold'],
		});
		const closeBtn = Button({
			content: '',
			variant: 'outline',
			classes: [
				'p-2',
				'rounded-full',
				'border-accent',
				'hover:border-primary',
				'transition-colors',
			],
		});
		const closeIcon = Icon({ icon: X, size: 'sm' });
		closeBtn.appendChild(closeIcon);
		closeBtn.addEventListener('click', closeModal);
		titleContainer.appendChild(titleIcon);
		titleContainer.appendChild(titleElement);
		header.appendChild(titleContainer);
		header.appendChild(closeBtn);
		const body = document.createElement('div');
		body.className = 'p-6 space-y-8';
		body.appendChild(ProfileHeaderSelf());
		const historyCard = Card({
			classes: [
				'flex',
				'flex-col',
				'gap-6',
				'p-8',
				'bg-background',
				'rounded-2xl',
				'shadow-xl',
			],
		});
		const historyHeader = Wrapper({
			classes: ['flex', 'items-center', 'gap-3'],
		});
		const historyIcon = Icon({
			icon: History,
			size: 'lg',
			classes: ['text-secondary', 'glow-secondary-animate'],
		});
		const historyTitle = Heading({
			level: 2,
			content: 'Game History',
			classes: ['text-2xl', 'font-bold'],
		});
		historyHeader.appendChild(historyIcon);
		historyHeader.appendChild(historyTitle);
		const historyContainer = Wrapper({ classes: ['overflow-x-auto'] });
		// Load self game history
		(async () => {
			const { fetchMatchResults } = await import('../api/matchResults');
			const user = store.getState().user;
			try {
				const matches = await fetchMatchResults();
				historyContainer.innerHTML = '';
				if (matches.length === 0) {
					const emptyDiv = document.createElement('div');
					emptyDiv.className = 'text-center text-muted p-8';
					emptyDiv.textContent = 'No games played yet';
					historyContainer.appendChild(emptyDiv);
				} else {
					historyContainer.appendChild(
						createGameHistoryTable(matches, user?.username || '')
					);
				}
			} catch (error) {
				console.error('Error loading game history:', error);
				historyContainer.innerHTML =
					'<div class="flex justify-center items-center p-8"><div class="text-red-400">Failed to load game history</div></div>';
			}
		})();
		historyCard.appendChild(historyHeader);
		historyCard.appendChild(historyContainer);
		body.appendChild(historyCard);
		modalContainer.appendChild(header);
		modalContainer.appendChild(body);
		return modalContainer;
	}

	function ProfileContentFriend(friendId: number) {
		const modalContainer = Wrapper({
			classes: [
				'bg-foreground',
				'rounded-2xl',
				'shadow-2xl',
				'max-w-4xl',
				'w-full',
				'max-h-[90vh]',
				'overflow-y-auto',
			],
		});
		const header = document.createElement('div');
		header.className =
			'flex items-center justify-between p-6 border-b border-accent';
		const titleContainer = Wrapper({
			classes: ['flex', 'items-center', 'gap-3'],
		});
		const titleIcon = Icon({
			icon: User,
			size: 'lg',
			classes: ['text-primary', 'glow-primary-animate'],
		});
		const titleElement = Heading({
			level: 2,
			content: 'Friend Profile',
			classes: ['text-2xl', 'font-bold'],
		});
		const closeBtn = Button({
			content: '',
			variant: 'outline',
			classes: [
				'p-2',
				'rounded-full',
				'border-accent',
				'hover:border-primary',
				'transition-colors',
			],
		});
		const closeIcon = Icon({ icon: X, size: 'sm' });
		closeBtn.appendChild(closeIcon);
		closeBtn.addEventListener('click', closeModal);
		titleContainer.appendChild(titleIcon);
		titleContainer.appendChild(titleElement);
		header.appendChild(titleContainer);
		header.appendChild(closeBtn);
		const body = document.createElement('div');
		body.className = 'p-6 space-y-8';
		// Load friend profile
		(async () => {
			try {
				const friendData = await fetchFriendMatchHistory(friendId);
				body.innerHTML = '';
				const friendHeader = ProfileHeaderFriend(
					friendData.friend,
					friendData.stats
				);
				body.appendChild(friendHeader);
				const historyCard = Card({
					classes: [
						'flex',
						'flex-col',
						'gap-6',
						'p-8',
						'bg-background',
						'rounded-2xl',
						'shadow-xl',
					],
				});
				const historyHeader = Wrapper({
					classes: ['flex', 'items-center', 'gap-3'],
				});
				const historyIcon = Icon({
					icon: History,
					size: 'lg',
					classes: ['text-secondary', 'glow-secondary-animate'],
				});
				const historyTitle = Heading({
					level: 2,
					content: 'Game History',
					classes: ['text-2xl', 'font-bold'],
				});
				historyHeader.appendChild(historyIcon);
				historyHeader.appendChild(historyTitle);
				const historyContainer = Wrapper({ classes: ['overflow-x-auto'] });
				if (friendData.matches.length === 0) {
					const emptyDiv = document.createElement('div');
					emptyDiv.className = 'text-center text-muted p-8';
					emptyDiv.textContent = 'No games played yet';
					historyContainer.appendChild(emptyDiv);
				} else {
					historyContainer.appendChild(
						createGameHistoryTable(
							friendData.matches,
							friendData.friend.username
						)
					);
				}
				historyCard.appendChild(historyHeader);
				historyCard.appendChild(historyContainer);
				body.appendChild(historyCard);
			} catch (error) {
				console.error('Error loading friend profile:', error);
				body.innerHTML =
					'<div class="flex justify-center items-center p-8"><div class="text-red-400">Failed to load friend profile</div></div>';
			}
		})();
		modalContainer.appendChild(header);
		modalContainer.appendChild(body);
		return modalContainer;
	}

	// Click outside to close
	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) closeModal();
	});

	if (options.mode === 'friend')
		overlay.appendChild(ProfileContentFriend(options.friendId));
	else overlay.appendChild(ProfileContentSelf());

	function createModal(title: string, content: HTMLElement) {
		const modalOverlay = document.createElement('div');
		modalOverlay.className =
			'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4';
		const modalContainer = document.createElement('div');
		modalContainer.className =
			'bg-foreground rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto';
		const header = document.createElement('div');
		header.className =
			'flex items-center justify-between p-6 border-b border-accent';
		const titleElement = Heading({
			level: 2,
			content: title,
			classes: ['text-xl', 'font-bold'],
		});
		const closeBtn = Button({
			content: '',
			variant: 'outline',
			classes: [
				'p-2',
				'rounded-full',
				'border-accent',
				'hover:border-primary',
				'transition-colors',
			],
		});
		const closeIcon = Icon({ icon: X, size: 'sm' });
		closeBtn.appendChild(closeIcon);
		const body = document.createElement('div');
		body.className = 'p-6';
		body.appendChild(content);
		const close = () => document.body.removeChild(modalOverlay);
		closeBtn.addEventListener('click', close);
		modalOverlay.addEventListener('click', (e) => {
			if (e.target === modalOverlay) close();
		});
		const escapeHandler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				close();
				document.removeEventListener('keydown', escapeHandler);
			}
		};
		document.addEventListener('keydown', escapeHandler);
		header.appendChild(titleElement);
		header.appendChild(closeBtn);
		modalContainer.appendChild(header);
		modalContainer.appendChild(body);
		modalOverlay.appendChild(modalContainer);
		return modalOverlay;
	}

	function showSettingsModal() {
		const isOAuthUser = localStorage.getItem('isOAuthUser') === 'true';
		const form = Wrapper({
			element: 'form',
			method: 'POST',
			classes: ['flex', 'flex-col', 'gap-6'],
		}) as HTMLFormElement;
		const avatarLabel = Label({
			content: 'Avatar:',
			classes: ['flex', 'items-center', 'gap-4', 'cursor-pointer'],
		});
		const user = store.getState().user;
		const avatarImg = Img({
			src: getAvatarUrl(user?.avatar, user?.username || 'User'),
			alt: 'Avatar',
			width: 48,
			height: 48,
			classes: ['rounded-full', 'border', 'border-accent', 'aspect-square'],
		});
		const avatarInput = Input({
			type: 'file',
			name: 'avatar',
			id: 'avatar',
			accept: '.png,image/png',
			classes: ['hidden'],
		});
		const uploadText = Text({
			content: 'Change avatar (PNG only)',
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
		const grid = Wrapper({ classes: ['grid', 'grid-cols-1', 'gap-6'] });
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
		const submitWrapper = Wrapper({ classes: ['flex', 'justify-end'] });
		const submitBtn = Button({
			type: 'submit',
			content: 'Save changes',
			classes: ['px-6'],
		});
		uploadText.prepend(uploadIcon);
		avatarLabel.appendChild(avatarImg);
		avatarLabel.appendChild(uploadText);
		avatarLabel.appendChild(avatarInput);
		usernameLabel.appendChild(usernameInput);
		emailLabel.appendChild(emailInput);
		passwordLabel.appendChild(passwordInput);
		submitWrapper.appendChild(submitBtn);
		if (!isOAuthUser) {
			grid.appendChild(usernameLabel);
			grid.appendChild(emailLabel);
			grid.appendChild(passwordLabel);
		}
		grid.appendChild(submitWrapper);
		form.appendChild(avatarLabel);
		form.appendChild(grid);
		avatarInput.addEventListener('change', (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			const existingError = form.querySelector('.avatar-error');
			if (existingError) existingError.remove();
			if (file) {
				if (file.type !== 'image/png') {
					const errorMessage = Text({
						content: 'Avatar must be a PNG file',
						classes: ['avatar-error', 'text-red-400', 'text-xs', 'mt-2'],
					});
					avatarLabel.appendChild(errorMessage);
					(e.target as HTMLInputElement).value = '';
					return;
				}
				avatarImg.src = URL.createObjectURL(file);
			}
		});
		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			if (avatarInput.files?.[0] && avatarInput.files[0].type !== 'image/png') {
				const existingError = form.querySelector('.avatar-error');
				if (existingError) existingError.remove();
				const errorMessage = Text({
					content: 'Avatar must be a PNG file',
					classes: ['avatar-error', 'text-red-400', 'text-xs', 'mt-2'],
				});
				avatarLabel.appendChild(errorMessage);
				return;
			}
			try {
				const formData = new FormData();
				if (usernameInput.value.trim())
					formData.append('username', usernameInput.value.trim());
				if (emailInput.value.trim())
					formData.append('email', emailInput.value.trim());
				if (passwordInput.value)
					formData.append('password', passwordInput.value);
				if (avatarInput.files?.[0])
					formData.append('avatar', avatarInput.files[0]);
				const res = await fetch('/api/profile', {
					method: 'PUT',
					body: formData,
					credentials: 'include',
				});
				const data = await res.json();
				if (res.ok && data.success) {
					const currentUser = store.getState().user;
					store.setState({ user: { ...currentUser, ...data.user } });
					await getFriends();
					await getFriendRequests();
					Toaster('Profile updated successfully');
					const modal = form.closest('.fixed');
					if (modal) document.body.removeChild(modal);
					window.location.reload();
				} else {
					Toaster(data.message || 'Failed to update profile');
				}
			} catch (error) {
				console.error('Profile update error:', error);
				Toaster('Failed to update profile');
			}
		});
		document.body.appendChild(createModal('Settings', form));
	}

	// Logout modal removed

	return overlay;
}

export default ProfileModal;
