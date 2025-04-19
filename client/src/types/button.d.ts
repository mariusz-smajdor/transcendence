import { ComponentProps } from './component';

export type ButtonSize = 'icon' | 'sm' | 'md' | 'lg';
export type ButtonVariant = 'primary' | 'ghost';

interface ButtonSharedProps extends ComponentProps {
	type?: 'button' | 'submit';
	variant?: ButtonVariant;
}

interface LinkBaseProps extends ButtonSharedProps {
	asLink: true;
	href: string;
}

interface ButtonBaseProps extends ButtonSharedProps {
	asLink?: false;
	href?: never;
}

interface IconLinkProps extends LinkBaseProps {
	size: 'icon';
	content?: never;
}
interface IconButtonProps extends ButtonBaseProps {
	size: 'icon';
	content?: never;
}

interface ContentLinkProps extends LinkBaseProps {
	size?: 'sm' | 'md' | 'lg';
	content: string;
}
interface ContentButtonProps extends ButtonBaseProps {
	size?: 'sm' | 'md' | 'lg';
	content: string;
}

export type ButtonProps =
	| IconButtonProps
	| IconLinkProps
	| ContentButtonProps
	| ContentLinkProps;
