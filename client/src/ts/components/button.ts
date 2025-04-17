interface ButtonProps {
	content: string;
	type?: 'button' | 'submit' | 'reset';
}

export function Button({ content, type = 'button' }: ButtonProps) {
	const button = document.createElement('button');
	button.textContent = content;
	button.type = type;
	button.classList.add(
		'flex',
		'items-center',
		'gap-2',
		'rounded-full',
		'cursor-pointer'
	);

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
		'border',
		'text-slate-900',
		'border-gray-300',
		'hover:bg-gray-100'
	);

	const svg = document.createElement('img');
	svg.src = '../../assets/google.svg';
	svg.classList.add('h-6', 'w-6', 'absolute', 'left-26');
	svg.alt = 'Google logo';
	button.prepend(svg);
	return button;
}
