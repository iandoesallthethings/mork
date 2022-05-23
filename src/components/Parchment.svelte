<script lang="ts">
	import '../web/web.css'

	// Input class: Input LineInput
	// https://ifarchive.org/if-archive/games/competition2011/zcode/andromeda/Andromeda%20Awakening.zblorb
	// https://eblong.com/infocom/gamefiles/zork1-r119-s880429.z3
	// https://ifarchive.org/if-archive/infocom/demos/minizork.z3
</script>

<div id="gameport">
	<div id="about">
		<p id="play-url">
			<input id="play-url-input" placeholder="Enter a URL of a story file" type="url" />
			<button id="play-url-button">Go</button>
		</p>
		<p id="play-url-error" />

		<label id="custom-file-upload" for="file-upload" tabindex="0" role="button">
			<p>Or, click here to play a story file on your device</p>
		</label>
		<input id="file-upload" type="file" style="display: none" />

		<noscript><p>Parchment requires Javascript. Please enable it in your browser.</p></noscript>
	</div>

	<div id="windowport" />

	<div id="loadingpane" style="display:none;">
		<img src="/web/waiting.gif" alt="LOADING" /><br />
		<em>&nbsp;&nbsp;&nbsp;Loading...</em>
	</div>

	<div id="errorpane" style="display:none;"><div id="errorcontent">...</div></div>
</div>

<style>
	input {
		@apply border rounded-md;
	}
</style>
