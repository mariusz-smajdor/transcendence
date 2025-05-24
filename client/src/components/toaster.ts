import { X } from 'lucide';
import { Card } from './card';
import { Icon } from './icon';
import { Text } from './text';

export function Toaster(message: string) {
	const card = Card({
		classes: [
			'flex',
			'gap-2',
			'absolute',
			'bottom-4',
			'right-4',
			'lg:bottom-6',
			'lg:right-6',
			'max-w-80',
			'w-full',
			'shadow-lg',
			'shadow-background',
			'z-50',
			'transition-all',
			'duration-500',
			'opacity-0',
			'translate-y-4',
		],
	});
	const content = Text({
		content:
			message +
			'asddddddasdsafsdfgsofudygvouasdngoulyrbsouyvnsouhibvoujhasneuhyvbousyrbtuykgosruyohivnpiusdrhbouyisniuopyvborduyhvbisrupoyhvouyrshtvo8ysrhv',
		classes: ['break-all'],
	});
	const closeIcon = Icon({
		icon: X,
		classes: [
			'shrink-0',
			'text-muted',
			'cursor-pointer',
			'hover:text-secondary',
			'transition-colors',
			'duration-300',
		],
	});

	card.appendChild(content);
	card.appendChild(closeIcon);
	document?.getElementById('app')?.appendChild(card);

	function fadeOut() {
		card.classList.remove('opacity-100', 'translate-y-0');
		card.classList.add('opacity-0', 'translate-y-4');

		setTimeout(() => {
			card.remove();
		}, 500);
	}

	closeIcon.addEventListener('click', () => {
		fadeOut();
	});

	requestAnimationFrame(() => {
		card.classList.remove('opacity-0', 'translate-y-4');
		card.classList.add('opacity-100', 'translate-y-0');
	});

	setTimeout(() => {
		fadeOut();
	}, 5000);
}
