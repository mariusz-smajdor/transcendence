import { ComponentProps } from '../types/component';

interface ImgProps extends ComponentProps {
	src: string;
	alt: string;
	width?: number;
	height?: number;
}

export function Img({ src, alt, width, height, classes = [] }: ImgProps) {
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

	return img;
}
