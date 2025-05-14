import { Router } from './router';
import { fetchMe } from './api/me';

document.addEventListener('DOMContentLoaded', async () => {
	await fetchMe();
	new Router();
});
