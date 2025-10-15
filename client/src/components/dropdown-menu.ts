import { type ComponentProps } from '../types/component';
import { Wrapper } from './wrapper';

type DropdownMenuProps = ComponentProps & {
	dropdownTrigger: Element;
	// Optional URL sync configuration to support back/forward navigation
	syncWithUrl?: boolean;
	urlParam?: string; // e.g., 'dropdown'
	urlValue?: string; // e.g., 'avatar'
	useReplaceState?: boolean; // default false => pushState
};

type DropdownItemProps = ComponentProps & {
	content: string;
};

export function DropdownSeparator() {
	const wrapper = Wrapper({
		classes: ['h-px', 'bg-accent', 'w-full'],
	});

	return wrapper;
}

export function DropdownItem({ content, classes = [] }: DropdownItemProps) {
	const wrapper = Wrapper({
		classes: [
			'flex',
			'items-center',
			'justify-between',
			'gap-2',
			'py-1',
			'px-2',
			'cursor-pointer',
			'rounded',
			'transition-colors',
			'duration-300',
			'hover:bg-background',
			...classes,
		],
	});
	wrapper.textContent = content;

	return wrapper;
}

export function DropdownTitle({ content, classes = [] }: DropdownItemProps) {
	const wrapper = Wrapper({
		classes: ['font-bold', 'py-1', 'px-2', ...classes],
	});
	wrapper.textContent = content;

	return wrapper;
}

export function DropdownMenu({
	dropdownTrigger,
	classes = [],
	syncWithUrl = false,
	urlParam,
	urlValue,
	useReplaceState = false,
}: DropdownMenuProps) {
	const wrapper = Wrapper({
		classes: [
			'flex',
			'flex-col',
			'gap-1',
			'absolute',
			'w-48',
			'p-1',
			'text-sm',
			'rounded',
			'bg-foreground',
			'border',
			'border-accent',
			'opacity-0',
			'scale-95',
			'transition-all',
			'duration-200',
			'ease-out',
			'transform',
			'pointer-events-none',
			'z-50',
		],
	});
	wrapper.classList.add(...classes);

	const openClasses = ['opacity-100', 'scale-100', 'pointer-events-auto'];
	const closedClasses = ['opacity-0', 'scale-95', 'pointer-events-none'];

	function openMenu(updateUrl = true) {
		wrapper.classList.remove(...closedClasses);
		wrapper.classList.add(...openClasses);
		if (syncWithUrl && urlParam && urlValue && updateUrl) {
			const url = new URL(window.location.href);
			url.searchParams.set(urlParam, urlValue);
			if (useReplaceState) {
				window.history.replaceState(null, '', url.toString());
			} else {
				window.history.pushState(null, '', url.toString());
			}
		}
	}

	function closeMenu(updateUrl = true) {
		wrapper.classList.remove(...openClasses);
		wrapper.classList.add(...closedClasses);
		if (syncWithUrl && urlParam && updateUrl) {
			const url = new URL(window.location.href);
			const current = url.searchParams.get(urlParam);
			if (current === urlValue) {
				url.searchParams.delete(urlParam);
				if (useReplaceState) {
					window.history.replaceState(null, '', url.toString());
				} else {
					window.history.pushState(null, '', url.toString());
				}
			}
		}
	}

	// Initialize from URL if configured
	if (syncWithUrl && urlParam && urlValue) {
		const current = new URL(window.location.href).searchParams.get(urlParam);
		if (current === urlValue) {
			// Open without updating URL to avoid duplicate entries
			openMenu(false);
		}
	}

	dropdownTrigger.addEventListener('click', () => {
		const isVisible = wrapper.classList.contains('opacity-100');
		if (isVisible) {
			closeMenu();
		} else {
			openMenu();
		}
	});

	// Optional: close on Escape
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			closeMenu();
		}
	});

	// Optional: close when clicking outside
	document.addEventListener('click', (e) => {
		const target = e.target as HTMLElement;
		if (!wrapper.contains(target) && target !== dropdownTrigger) {
			const hasModal = new URL(window.location.href).searchParams.get('modal');
			if (hasModal) {
				// Avoid adding a new history entry while a modal manages URL state
				closeMenu(false);
			} else {
				closeMenu();
			}
		}
	});

	// Expose programmatic controls for external usage (e.g., close on Profile open)
	(wrapper as any).closeMenu = (updateUrl: boolean = true) =>
		closeMenu(updateUrl);
	(wrapper as any).openMenu = (updateUrl: boolean = true) =>
		openMenu(updateUrl);

	return wrapper;
}
