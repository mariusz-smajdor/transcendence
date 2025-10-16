import { type ComponentProps } from '../types/component';
import { Button } from './button';
import { Wrapper } from './wrapper';
// navigation removed: no history manager required

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
	// Optional: enable back button support for tabs
	enableHistory?: boolean;
	tabGroupId?: string; // Unique identifier for this tab group
	// Optional: URL paths for each tab
	tabUrls?: Record<string, string>;
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

export function Tabs({
	classes = [],
	defaultValue,
	triggers,
	tabs,
	// navigation options removed
}: TabsProps) {
	const wrapper = Wrapper({
		classes: ['flex', 'flex-col', 'gap-4', 'lg:gap-6', ...classes!],
	});
	const triggerButtons = Wrapper({
		classes: ['flex', 'p-1', 'bg-accent', 'w-full', 'rounded', 'gap-1'],
	});

	let currentTab = defaultValue;

	triggers.forEach((trigger) => {
		triggerButtons.appendChild(trigger);
	});
	wrapper.appendChild(triggerButtons);
	tabs.forEach((tab) => {
		tab.classList.add('hidden');
		wrapper.appendChild(tab);
	});

	const activateTab = (value: string) => {
		currentTab = value;

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

		// No-op: navigation/history removed - do not push state
	};

	triggers.forEach((trigger) => {
		trigger.addEventListener('click', () => {
			if (trigger.dataset.value && trigger.dataset.value !== currentTab) {
				activateTab(trigger.dataset.value);
			}
		});
	});

	// Initialize with default tab or URL-based tab
	// Initialize with default tab
	activateTab(defaultValue);

	return wrapper;
}
