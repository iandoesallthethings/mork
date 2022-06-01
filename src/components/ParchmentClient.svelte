<script lang="ts">
	import '../web/web.css'
	import type { HtmlString } from '$lib/types'

	import io from '$lib/socketClient'
	import { onMount } from 'svelte'

	let gameHtml: HtmlString = ''

	function scrollWindowToBottom() {
		const bufferWindow = document.querySelector('.BufferWindowInner')
		if (bufferWindow) bufferWindow.scrollTop = bufferWindow.scrollHeight
	}

	function updateGameWindow(newHtml: HtmlString) {
		gameHtml = newHtml
		scrollWindowToBottom()
	}

	onMount(() => {
		io.on('updateGame', updateGameWindow)
	})
</script>

<div id="gameport">
	<noscript><p>Parchment requires Javascript. Please enable it in your browser.</p></noscript>

	<div id="windowport">
		{@html gameHtml}
	</div>
</div>

<style>
	input {
		@apply border rounded-md;
	}

	#gameport {
		@apply max-h-full h-full;
	}
</style>
