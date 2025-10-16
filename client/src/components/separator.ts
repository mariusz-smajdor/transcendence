import { Wrapper } from './wrapper';
import { t } from '../services/i18n';

export function Separator() {
	const wrapper = Wrapper({
		classes: ['flex', 'items-center', 'gap-2', 'w-full'],
	});

	const line = document.createElement('div');
	line.classList.add('h-px', 'flex-1', 'bg-accent');

	const text = document.createElement('span');
	text.textContent = t('auth.or');
	text.classList.add('text-xs', 'text-muted', 'whitespace-nowrap');
	text.setAttribute('data-i18n', 'auth.or');

	wrapper.appendChild(line);
	wrapper.appendChild(text);
	wrapper.appendChild(line.cloneNode(true));

	return wrapper;
}
