import { createElement, ArrowRight } from 'lucide';

export default function Header() {
	const header = document.createElement('header');
	header.classList.add('flex', 'h-14', 'w-full', 'items-center', 'shadow-sm');

	const lucideIcon = createElement(ArrowRight);
	header.appendChild(lucideIcon);

	// header.appendChild(container);
	return header;
}
