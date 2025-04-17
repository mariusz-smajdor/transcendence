import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [tailwindcss()],
	server: {
		port: 8080,
		host: true,
		watch: {
			usePolling: true,
			interval: 100,
		},
	},
});
