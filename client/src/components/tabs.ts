import { type ComponentProps } from '../types/component';
import { Button } from './button';
import { Wrapper } from './wrapper';
import { historyManager } from '../utils/historyManager';

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
	enableHistory = false,
	tabGroupId = 'default',
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

	const activateTab = (value: string, pushHistory = false) => {
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

		// Push history state if enabled and not default tab
		if (enableHistory && pushHistory && value !== defaultValue) {
			historyManager.pushState('tab', { tabGroupId, tabValue: value });
		}
	};

	triggers.forEach((trigger) => {
		trigger.addEventListener('click', () => {
			if (trigger.dataset.value && trigger.dataset.value !== currentTab) {
				activateTab(trigger.dataset.value, true);
			}
		});
	});

	// Handle back button
	if (enableHistory) {
		const handleHistory = (state: any) => {
			if (state.type === 'tab' && state.data?.tabGroupId === tabGroupId) {
				activateTab(state.data.tabValue, false);
			} else if (state.type === 'base' || !state.data) {
				// When going back to base state, show default tab
				activateTab(defaultValue, false);
			}
		};

		historyManager.on('tab', handleHistory);
		historyManager.on('base', handleHistory);
	}

	// Initialize with default tab
	activateTab(defaultValue, false);

	return wrapper;
}
