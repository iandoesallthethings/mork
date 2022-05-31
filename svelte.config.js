import adapter from '@sveltejs/adapter-node'
import preprocess from 'svelte-preprocess'
import { configureWebsocket } from './src/lib/socketServer.js'

const dev = process.env.NODE_ENV === 'development'

const inspector = dev
	? {
			toggleKeyCombo: 'meta-shift',
			holdMode: true
	  }
	: {}

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
		},
		alias: {
			$components: 'src/components'
		}
	},
	experimental: { inspector }
}

export default config
