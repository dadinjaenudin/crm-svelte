import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: '0.0.0.0',
		port: 5173,
		allowedHosts: [
			'5173-imiwsr37ew4twbhh8q98b-2b54fc91.sandbox.novita.ai',
			'.sandbox.novita.ai'
		]
	}
});
