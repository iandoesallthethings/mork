<script>
	import '../app.css'
</script>

<h1 class="px-10">Welcome To MORK</h1>

<main>
	<slot />
</main>

<style>
	main {
		@apply max-h-screen;
	}

	@font-face {
		font-family: 'Iosevka';
		src: url('fonts/iosevka/iosevka-regular.woff2') format('woff2');
	}
</style>
