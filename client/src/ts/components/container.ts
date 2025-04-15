export function Container(): HTMLDivElement {
	const container: HTMLDivElement = document.createElement('div');
	container.classList.add('container', 'mx-auto', 'px-6');

	return container;
}
