import { type ComponentProps } from '../types/component';
import { Button } from './button';
import { Wrapper } from './wrapper';

type TriggersArray = [
	HTMLButtonElement,
	HTMLButtonElement,
	...HTMLButtonElement[]
];

type TabsArray = [HTMLElement, HTMLElement, ...HTMLElement[]];

type TriggerProps = ComponentProps & {
	content: string;
	value: string;
};

type TabProps = ComponentProps & {
	value: string;
};

type TabsProps = ComponentProps & {
	defaultValue: string;
	triggers: TriggersArray;
	tabs: TabsArray;
};

export function Tab({ value, classes }: TabProps) {
	const wrapper = Wrapper({ classes });
	wrapper.dataset.value = value;

	return wrapper;
}

export function Trigger({ content, value }: TriggerProps) {
	const button = Button({
		content,
		variant: 'tab',
		classes: ['text-sm', 'flex-1', 'text-muted', 'border-none'],
	});
	button.dataset.value = value;

	return button;
}

export function Tabs({ classes, defaultValue, triggers, tabs }: TabsProps) {
	const wrapper = Wrapper({
		classes: ['flex', 'flex-col', 'gap-4', 'lg:gap-6', ...classes!],
	});
	const triggerButtons = Wrapper({
		classes: ['flex', 'p-1', 'bg-accent', 'w-full', 'rounded', 'gap-1'],
	});

	triggers.forEach((trigger) => {
		triggerButtons.appendChild(trigger);
	});
	wrapper.appendChild(triggerButtons);
	tabs.forEach((tab) => {
		tab.classList.add('hidden');
		wrapper.appendChild(tab);
	});
	triggers.forEach((trigger) => {
		trigger.addEventListener('click', () => {
			if (trigger.dataset.value) {
				activateTab(trigger.dataset.value);
			}
		});
	});

	const activateTab = (value: string) => {
		tabs.forEach((tab) => {
			if (tab.dataset.value === value) {
				tab.classList.remove('hidden');
			} else {
				tab.classList.add('hidden');
			}
		});

		triggers.forEach((trigger) => {
			if (trigger.dataset.value === value) {
				trigger.classList.add('text-white', 'bg-background');
			} else {
				trigger.classList.remove('text-white', 'bg-background');
			}
		});
	};
	activateTab(defaultValue);

	return wrapper;
}
