import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

// Constants
// For Docker environment, use service names
const SERVER_TARGET = process.env.VITE_SERVER_URL || 'https://server:3000';
const WS_TARGET = process.env.VITE_WS_URL || 'wss://server:3000';
const CLIENT_PORT = parseInt(process.env.VITE_CLIENT_PORT || '8080');
const CLIENT_HOST = process.env.VITE_CLIENT_HOST || '0.0.0.0';

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
		host: CLIENT_HOST,
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
