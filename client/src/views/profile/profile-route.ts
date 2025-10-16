import {
	CloudUpload,
	UserCog,
	ArrowLeft,
	History,
	Settings,
	LogOut,
	User,
	Mail,
	X,
} from 'lucide';
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
import { Toaster } from '../../components/toaster';
import { getAvatarUrl } from '../../utils/avatarUtils';
import { getFriends, getFriendRequests } from '../../api/friendRequest';
import { historyManager } from '../../utils/historyManager';
import {
	fetchMatchResults,
	fetchMatchStats,
	type MatchResult,
	type MatchStats,
} from '../../api/matchResults';
import {
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableHeaderCell,
	TableRow,
} from '../../components/table';
import { deleteCookie } from '../../game/game-cookies';

export default function ProfileRoute() {
	const user = store.getState().user;

	// Redirect to home if user is not logged in
	if (!user) {
		// No navigation: do not push state
		return document.createElement('div'); // Return empty div as placeholder
	}

	const container = Wrapper({
		classes: ['min-h-screen', 'bg-background', 'p-4', 'py-8'],
	});

	function ProfileHeader() {
		const headerCard = Card({
			classes: [
				'flex',
				'flex-col',
				'md:flex-row',
				'items-center',
				'gap-6',
				'p-8',
				'bg-foreground',
				'rounded-2xl',
				'shadow-xl',
				'mb-8',
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

		const emailIcon = Icon({
			icon: Mail,
			size: 'sm',
		});

		const emailText = Text({
			content: user?.email || 'No email',
			classes: ['text-lg'],
		});

		emailDisplay.appendChild(emailIcon);
		emailDisplay.appendChild(emailText);

		const statsSection = Wrapper({
			classes: ['flex', 'gap-6', 'mt-4'],
		});

		// This will be populated by loadUserStats
		const statsContainer = Wrapper({
			classes: ['flex', 'gap-6'],
		});

		// Action buttons
		const actionButtons = Wrapper({
			classes: ['flex', 'gap-4', 'mt-6'],
		});

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

		const settingsIcon = Icon({
			icon: Settings,
			size: 'sm',
		});

		const logoutBtn = Button({
			content: 'Logout',
			variant: 'outline',
			classes: [
				'flex',
				'items-center',
				'gap-2',
				'border-red-400',
				'text-red-400',
				'hover:bg-red-400',
				'hover:text-white',
				'transition-colors',
			],
		});

		const logoutIcon = Icon({
			icon: LogOut,
			size: 'sm',
		});

		settingsBtn.prepend(settingsIcon);
		logoutBtn.prepend(logoutIcon);

		// Add click handlers
		settingsBtn.addEventListener('click', () => {
			showSettingsModal();
		});

		logoutBtn.addEventListener('click', () => {
			showLogoutModal();
		});

		avatarSection.appendChild(avatarImg);
		userInfo.appendChild(usernameDisplay);
		userInfo.appendChild(emailDisplay);
		userInfo.appendChild(statsSection);
		statsSection.appendChild(statsContainer);
		actionButtons.appendChild(settingsBtn);
		actionButtons.appendChild(logoutBtn);
		userInfo.appendChild(actionButtons);

		headerCard.appendChild(avatarSection);
		headerCard.appendChild(userInfo);

		// Load user stats
		loadUserStats(statsContainer);

		return headerCard;
	}

	async function loadUserStats(container: HTMLElement) {
		try {
			const stats = await fetchMatchStats();

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

	function GameHistorySection() {
		const historyCard = Card({
			classes: [
				'flex',
				'flex-col',
				'gap-6',
				'p-8',
				'bg-foreground',
				'rounded-2xl',
				'shadow-xl',
				'mb-8',
			],
		});

		const header = Wrapper({
			classes: ['flex', 'items-center', 'gap-3'],
		});

		const historyIcon = Icon({
			icon: History,
			size: 'lg',
			classes: ['text-secondary', 'glow-secondary-animate'],
		});

		const title = Heading({
			level: 2,
			content: 'Game History',
			classes: ['text-2xl', 'font-bold'],
		});

		header.appendChild(historyIcon);
		header.appendChild(title);

		const historyContainer = Wrapper({
			classes: ['overflow-x-auto'],
		});

		// Loading state
		const loadingDiv = document.createElement('div');
		loadingDiv.className = 'flex justify-center items-center p-8';
		loadingDiv.innerHTML =
			'<div class="text-muted">Loading game history...</div>';
		historyContainer.appendChild(loadingDiv);

		// Load game history
		loadGameHistory(historyContainer);

		historyCard.appendChild(header);
		historyCard.appendChild(historyContainer);

		return historyCard;
	}

	async function loadGameHistory(container: HTMLElement) {
		try {
			const matches = await fetchMatchResults();

			// Clear loading state
			container.innerHTML = '';

			if (matches.length === 0) {
				const emptyDiv = document.createElement('div');
				emptyDiv.className = 'text-center text-muted p-8';
				emptyDiv.textContent = 'No games played yet';
				container.appendChild(emptyDiv);
				return;
			}

			// Create table
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
					match.winner === user?.username
						? TableCell({
								content: match.score,
								classes: match.score.includes('Walkover')
									? ['text-green-400', 'font-bold']
									: ['text-green-400'],
						  })
						: TableCell({
								content: match.score.split(' - ').reverse().join(' - '),
								classes: match.score.includes('Walkover')
									? ['text-red-400', 'font-bold']
									: ['text-red-400'],
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
			container.appendChild(table);
		} catch (error) {
			console.error('Error loading game history:', error);
			container.innerHTML = `
				<div class="flex justify-center items-center p-8">
					<div class="text-red-400">Failed to load game history</div>
				</div>
			`;
		}
	}

	function showSettingsModal() {
		const modal = createModal('Settings', createSettingsForm());
		document.body.appendChild(modal);
	}

	function showLogoutModal() {
		const modal = createModal('Logout', createLogoutForm());
		document.body.appendChild(modal);
	}

	function createModal(title: string, content: HTMLElement) {
		// Modal overlay
		const overlay = document.createElement('div');
		overlay.className =
			'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';

		// Modal container
		const modalContainer = document.createElement('div');
		modalContainer.className =
			'bg-foreground rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto';

		// Modal header
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

		const closeIcon = Icon({
			icon: X,
			size: 'sm',
		});

		closeBtn.appendChild(closeIcon);

		// Modal body
		const body = document.createElement('div');
		body.className = 'p-6';
		body.appendChild(content);

		// Close modal function
		const closeModal = () => {
			document.body.removeChild(overlay);
		};

		// Event listeners
		closeBtn.addEventListener('click', closeModal);
		overlay.addEventListener('click', (e) => {
			if (e.target === overlay) {
				closeModal();
			}
		});

		// Escape key listener
		const escapeHandler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				closeModal();
				document.removeEventListener('keydown', escapeHandler);
			}
		};
		document.addEventListener('keydown', escapeHandler);

		header.appendChild(titleElement);
		header.appendChild(closeBtn);
		modalContainer.appendChild(header);
		modalContainer.appendChild(body);
		overlay.appendChild(modalContainer);

		return overlay;
	}

	function createSettingsForm() {
		const user = store.getState().user;
		const isOAuthUser =
			user?.google_id !== null && user?.google_id !== undefined;

		const form = Wrapper({
			element: 'form',
			method: 'POST',
			classes: ['flex', 'flex-col', 'gap-6'],
		}) as HTMLFormElement;

		const avatarLabel = Label({
			content: 'Avatar:',
			classes: ['flex', 'items-center', 'gap-4', 'cursor-pointer'],
		});

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

		const grid = Wrapper({
			classes: ['grid', 'grid-cols-1', 'gap-6'],
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
			classes: ['flex', 'justify-end'],
		});

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

			// Remove any existing error message
			const existingError = form.querySelector('.avatar-error');
			if (existingError) {
				existingError.remove();
			}

			if (file) {
				// Check if file is PNG
				if (file.type !== 'image/png') {
					// Show error message
					const errorMessage = Text({
						content: 'Avatar must be a PNG file',
						classes: ['avatar-error', 'text-red-400', 'text-xs', 'mt-2'],
					});
					avatarLabel.appendChild(errorMessage);

					// Clear the file input
					(e.target as HTMLInputElement).value = '';
					return;
				}

				// If valid PNG, update the preview
				avatarImg.src = URL.createObjectURL(file);
			}
		});

		form.addEventListener('submit', async (e) => {
			e.preventDefault();

			// Validate avatar file type before submission
			if (avatarInput.files?.[0] && avatarInput.files[0].type !== 'image/png') {
				// Remove any existing error message
				const existingError = form.querySelector('.avatar-error');
				if (existingError) {
					existingError.remove();
				}

				// Show error message
				const errorMessage = Text({
					content: 'Avatar must be a PNG file',
					classes: ['avatar-error', 'text-red-400', 'text-xs', 'mt-2'],
				});
				avatarLabel.appendChild(errorMessage);
				return;
			}

			try {
				const formData = new FormData();

				if (usernameInput.value.trim()) {
					formData.append('username', usernameInput.value.trim());
				}
				if (emailInput.value.trim()) {
					formData.append('email', emailInput.value.trim());
				}
				if (passwordInput.value) {
					formData.append('password', passwordInput.value);
				}
				if (avatarInput.files?.[0]) {
					formData.append('avatar', avatarInput.files[0]);
				}

				const res = await fetch('/api/profile', {
					method: 'PUT',
					body: formData,
					credentials: 'include',
				});

				const data = await res.json();

				if (res.ok && data.success) {
					// Update the store with new user data, preserving existing friends data
					const currentUser = store.getState().user;
					store.setState({
						user: {
							...currentUser,
							...data.user,
						},
					});

					// Refresh friends data to ensure it's not lost during re-render
					await getFriends();
					await getFriendRequests();

					Toaster('Profile updated successfully');
					// Close modal and refresh the page to show updated data
					const modal = form.closest('.fixed');
					if (modal) {
						document.body.removeChild(modal);
					}
					window.location.reload();
				} else {
					Toaster(data.message || 'Failed to update profile');
				}
			} catch (error) {
				console.error('Profile update error:', error);
				Toaster('Failed to update profile');
			}
		});

		return form;
	}

	function createLogoutForm() {
		const form = Wrapper({
			classes: ['flex', 'flex-col', 'gap-6'],
		});

		const warningText = Text({
			content:
				'Are you sure you want to logout? You will need to login again to access your account.',
			classes: ['text-muted', 'text-center'],
		});

		const buttonWrapper = Wrapper({
			classes: ['flex', 'gap-4', 'justify-end'],
		});

		const cancelBtn = Button({
			content: 'Cancel',
			variant: 'outline',
			classes: ['px-6'],
		});

		const logoutBtn = Button({
			content: 'Logout',
			variant: 'outline',
			classes: [
				'px-6',
				'border-red-400',
				'text-red-400',
				'hover:bg-red-400',
				'hover:text-white',
				'transition-colors',
			],
		});

		cancelBtn.addEventListener('click', () => {
			const modal = form.closest('.fixed');
			if (modal) {
				document.body.removeChild(modal);
			}
		});

		logoutBtn.addEventListener('click', async () => {
			try {
				const res = await fetch('/api/logout', {
					method: 'POST',
					credentials: 'include',
				});

				if (res.ok) {
					// Clear access token cookie
					deleteCookie('access_token');

					// Clear the store
					store.setState({ user: null });

					Toaster('Logged out successfully');

					// Close modal
					const modal = form.closest('.fixed');
					if (modal) {
						document.body.removeChild(modal);
					}

					// No navigation: do not push state
				} else {
					Toaster('Failed to logout');
				}
			} catch (error) {
				console.error('Logout error:', error);
				Toaster('Failed to logout');
			}
		});

		buttonWrapper.appendChild(cancelBtn);
		buttonWrapper.appendChild(logoutBtn);

		form.appendChild(warningText);
		form.appendChild(buttonWrapper);

		return form;
	}

	function NavigationHeader() {
		const navCard = Card({
			classes: [
				'flex',
				'items-center',
				'gap-4',
				'p-4',
				'bg-foreground',
				'rounded-2xl',
				'shadow-xl',
				'mb-8',
			],
		});

		const backBtn = Button({
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

		const backIcon = Icon({
			icon: ArrowLeft,
			size: 'sm',
		});

		const titleContainer = Wrapper({
			classes: ['flex', 'items-center', 'gap-3', 'flex-1'],
		});

		const titleIcon = Icon({
			icon: User,
			size: 'lg',
			classes: ['text-primary', 'glow-primary-animate'],
		});

		const titleContent = Heading({
			level: 1,
			classes: ['text-2xl', 'font-bold'],
			content: 'Profile',
		});

		backBtn.appendChild(backIcon);
		backBtn.addEventListener('click', () => {
			historyManager.back();
		});

		titleContainer.appendChild(titleIcon);
		titleContainer.appendChild(titleContent);

		navCard.appendChild(backBtn);
		navCard.appendChild(titleContainer);

		return navCard;
	}

	// Add all sections to container
	container.appendChild(NavigationHeader());
	container.appendChild(ProfileHeader());
	container.appendChild(GameHistorySection());

	return container;
}
