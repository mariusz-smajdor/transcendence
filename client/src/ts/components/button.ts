interface ButtonType {
	type: 'button' | 'submit' | 'reset';
	content: string;
}

export function Button({ type, content }: ButtonType): HTMLElement {
	const button = document.createElement('button');
	button.type = type;
	button.classList.add(
		'rounded-full',
		'bg-blue-500',
		'text-white',
		'p-2',
		'mb-4',
		'w-full'
	);
	button.textContent = content;

	return button;
}

export function GoogleButton(): HTMLElement {
	const button = Button({
		type: 'button',
		content: 'Sign in with Google',
	});
	button.classList.add(
		'relative',
		'bg-white',
		'text-slate-900',
		'border',
		'border-gray-300',
		'hover:bg-gray-100',
	);
// append svg icon from ../assets/google.svg
	const svg = document.createElement('img');
	svg.src = '../../assets/google.svg';
	svg.classList.add('w-6', 'h-6', 'absolute', 'left-26');
	svg.alt = 'Google logo';
	button.prepend(svg);
	return button;
}
