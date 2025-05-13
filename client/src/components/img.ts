import { ComponentProps } from '../types/component';

type ImgProps = ComponentProps & {
	src: string;
	alt: string;
	width?: number;
	height?: number;
	loading?: 'eager' | 'lazy';
};

export function Img({
	src,
	alt,
	width,
	height,
	loading,
	classes = [],
}: ImgProps) {
	const img = document.createElement('img');
	img.src = src;
	img.alt = alt;
	img.classList.add(...classes);

	if (width) {
		img.width = width;
	}
	if (height) {
		img.height = height;
	}
	if (loading) {
		img.loading = loading;
	}

	return img;
}
