import { type ComponentProps } from '../types/component';
import { Wrapper } from './wrapper';

interface DropdownMenuProps extends ComponentProps {
	dropdownTrigger: HTMLElement;
}

interface DropdownTitleProps {
	content: string;
}

export function DropdownSeparator() {
	const wrapper = Wrapper({
		classes: ['h-px', 'bg-accent', 'w-full'],
	});

	return wrapper;
}

export function DropdownItem({ classes = [] }: ComponentProps) {
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
			'duration-200',
			'hover:bg-accent',
			...classes,
		],
	});

	return wrapper;
}

export function DropdownTitle({ content }: DropdownTitleProps) {
	const wrapper = Wrapper({
		classes: ['font-bold', 'py-1', 'px-2'],
	});
	wrapper.textContent = content;

	return wrapper;
}

export function DropdownMenu({
	dropdownTrigger,
	classes = [],
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
			'bg-background',
			'border',
			'border-accent',
			'opacity-0',
			'scale-95',
			'transition-all',
			'duration-200',
			'ease-out',
			'transform',
			'pointer-events-none',
		],
	});
	wrapper.classList.add(...classes);

	dropdownTrigger.addEventListener('click', () => {
		const isVisible = wrapper.classList.contains('opacity-100');
		if (isVisible) {
			wrapper.classList.remove(
				'opacity-100',
				'scale-100',
				'pointer-events-auto'
			);
			wrapper.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
		} else {
			wrapper.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
			wrapper.classList.add('opacity-100', 'scale-100', 'pointer-events-auto');
		}
	});

	return wrapper;
}
