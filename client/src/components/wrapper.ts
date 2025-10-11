import { type ComponentProps } from '../types/component';

type WrapperProps =
	| (ComponentProps & { element?: 'div' | 'main' | 'section' | 'header' })
	| (ComponentProps & { element: 'form'; method: 'GET' | 'POST' });

export function Wrapper(props: WrapperProps) {
	const { element = 'div', classes = [] } = props;

	const wrapper = document.createElement(element);
	wrapper.classList.add(...classes);

	// Type narrowing to access `method` safely
	if (element === 'form') {
		const formMethod = (props as { method: 'GET' | 'POST' }).method;
		wrapper.setAttribute('method', formMethod);
	}

	return wrapper;
}
