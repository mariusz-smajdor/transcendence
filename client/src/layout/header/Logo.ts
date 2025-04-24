import { Eclipse } from 'lucide';
import { Icon } from '../../components/icon';
import { Span } from '../../components/span';
import { Wrapper } from '../../components/wrapper';

export default function Logo() {
	const wrapper = Wrapper({
		classes: ['flex', 'cursor-pointer', 'items-center', 'gap-1', 'select-none'],
	});
	wrapper.addEventListener('click', () => {
		window.location.href = '/';
	});
	wrapper.appendChild(Icon({ icon: Eclipse, strokeWidth: 3, size: 'md' }));
	wrapper.appendChild(Span({ content: 'Super Pong', classes: ['font-bold'] }));

	return wrapper;
}
