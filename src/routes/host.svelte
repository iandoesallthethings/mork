<script lang="ts">
	import ParchmentHost from '$components/ParchmentHost.svelte'
	import Multiplayer from '$components/Multiplayer.svelte'
</script>

<div id="columns" class="flex flex-row w-screen space-x-4 px-4">
	<div><ParchmentHost /></div>
	<div><Multiplayer /></div>
</div>

<style>
	div {
		@apply w-full;
	}
</style>
