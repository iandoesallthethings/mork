import adapter from '@sveltejs/adapter-node'
import preprocess from 'svelte-preprocess'
import { configureWebsocket } from './src/lib/socketServer.js'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess(),
	kit: {
		adapter: adapter(),
		vite: {
			plugins: [
				{
					name: 'sveltekit-socket-io',
					configureServer: configureWebsocket
				}
			]
		}
	}
}

export default config
