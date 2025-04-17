export function Wrapper(classes: string[] = []): HTMLDivElement {
	const wrapper = document.createElement('div');
	wrapper.classList.add(...classes);

	return wrapper;
}
