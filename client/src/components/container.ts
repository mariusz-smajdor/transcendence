export function Container(classes: string[] = []): HTMLDivElement {
	const container: HTMLDivElement = document.createElement('div');
	container.classList.add('container', 'mx-auto', 'px-6', ...classes);

	return container;
}
