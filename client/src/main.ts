import { fetchMe } from './api/me';
import { Router } from './router';

document.addEventListener('DOMContentLoaded', async () => {
	await fetchMe();
	new Router();
});
