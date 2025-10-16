import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

// Constants
const SERVER_TARGET = 'https://10.12.4.4:3000';
const WS_TARGET = 'wss://10.12.4.4:3000';
const CLIENT_PORT = 8080;

// Helper functions
const createWebSocketProxy = (target = WS_TARGET) => ({
	target,
	ws: true,
	changeOrigin: true,
	secure: false,
});

const createProxyLogger = (proxy) => {
	proxy.on('error', (err) => console.log('Proxy error:', err));
	proxy.on('proxyReq', (_, req) => console.log(`→ ${req.method} ${req.url}`));
	proxy.on('proxyRes', (proxyRes, req) =>
		console.log(`← ${proxyRes.statusCode} ${req.url}`)
	);
};

// WebSocket endpoints
const wsEndpoints = [
	'/invitations',
	'/notifications',
	'/game',
	'/localgame',
	'/aigame',
	'/tournament/match',
];

export default defineConfig({
	plugins: [tailwindcss()],
	server: {
		port: CLIENT_PORT,
		host: true,
		https: {
			key: fs.readFileSync(path.join(__dirname, 'certs', 'localhost.key')),
			cert: fs.readFileSync(path.join(__dirname, 'certs', 'localhost.crt')),
		},
		proxy: {
			// API proxy with logging
			'/api': {
				target: SERVER_TARGET,
				changeOrigin: true,
				secure: false,
				rewrite: (path) => path.replace(/^\/api/, ''),
				configure: createProxyLogger,
			},
			// WebSocket proxies
			...Object.fromEntries(
				wsEndpoints.map((endpoint) => [endpoint, createWebSocketProxy()])
			),
		},
		watch: {
			usePolling: true,
			interval: 100,
		},
	},
});
