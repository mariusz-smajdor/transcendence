import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
	plugins: [tailwindcss()],
	server: {
		port: 8080,
		host: true,
		https: {
			key: fs.readFileSync(path.join(__dirname, 'certs', 'localhost.key')),
			cert: fs.readFileSync(path.join(__dirname, 'certs', 'localhost.crt')),
		},
		proxy: {
			// Proxy API requests to avoid CORS and SSL issues
			'/api': {
				target: 'https://server:3000', // Use HTTPS for container communication
				changeOrigin: true,
				secure: false, // Allow self-signed certificates
				rewrite: (path) => path.replace(/^\/api/, ''),
				configure: (proxy, _options) => {
					proxy.on('error', (err, _req, _res) => {
						console.log('proxy error', err);
					});
					proxy.on('proxyReq', (proxyReq, req, _res) => {
						console.log('Sending Request to the Target:', req.method, req.url);
					});
					proxy.on('proxyRes', (proxyRes, req, _res) => {
						console.log(
							'Received Response from the Target:',
							proxyRes.statusCode,
							req.url
						);
					});
				},
			},
			// Proxy WebSocket connections
			'/invitations': {
				target: 'wss://server:3000',
				ws: true,
				changeOrigin: true,
				secure: false,
			},
			'/notifications': {
				target: 'wss://server:3000',
				ws: true,
				changeOrigin: true,
				secure: false,
			},
			'/game': {
				target: 'wss://server:3000',
				ws: true,
				changeOrigin: true,
				secure: false,
			},
			'/localgame': {
				target: 'wss://server:3000',
				ws: true,
				changeOrigin: true,
				secure: false,
			},
			'/aigame': {
				target: 'wss://server:3000',
				ws: true,
				changeOrigin: true,
				secure: false,
			},
			'/tournament/match': {
				target: 'wss://server:3000',
				ws: true,
				changeOrigin: true,
				secure: false,
			},
		},
		watch: {
			usePolling: true,
			interval: 100,
		},
	},
});
