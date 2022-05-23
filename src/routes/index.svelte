<script lang="ts">
	import type { Message, Command, CommandQueue } from '$lib/types'
	import { onMount } from 'svelte'
	import { client as io } from '$lib/socketClient'
	import { fade } from 'svelte/transition'
	import { distanceFromNow } from '$lib/timeString'

	let userId = ''
	let username = ''
	let messageText = ''
	let commandText = ''

	let messages: Message[] = []
	let commands: CommandQueue = {}

	onMount(() => {
		io.on('message', (message) => {
			message.time = new Date(message.time)
			messages = [...messages, message]
		})

		io.on('name', (name) => (userId = name))
		io.on('commands', (newCommands) => (commands = newCommands))
	})

	function sendMessage() {
		messageText = messageText.trim()
		if (!messageText) return

		io.emit('message', { username, text: messageText })
		messageText = ''
	}

	function submitCommand() {
		commandText = commandText.trim()
		if (!commandText) return

		io.emit('command', { text: commandText })
		commandText = ''
	}

	function queueCommand() {
		commandText = commandText.trim()
		if (!commandText) return

		io.emit('queueCommand', { text: commandText })
	}
</script>

<div id="messages">
	{#each messages as message}
		<div class="message" transition:fade|local={{ duration: 250 }}>
			<div class="info">{message.username || message.userId} - {distanceFromNow(message.time)}</div>
			<div class="message-text">{message.text}</div>
		</div>
	{/each}
</div>

<form action="#" on:submit|preventDefault={sendMessage}>
	<h3>Chat</h3>
	<textarea bind:value={messageText} placeholder="Write something" />
	<div>
		<button type="submit">send</button>
		as
		<input type="text" bind:value={username} placeholder={userId} class="px-2" />
	</div>
</form>

<div id="messageQueue">
	{#each Object.entries(commands) as [userId, command]}
		<div>{userId}: {command}</div>
	{/each}
</div>

<form action="#" on:submit|preventDefault={submitCommand} on:input={queueCommand}>
	<h3>Command</h3>
	<textarea bind:value={commandText} placeholder="Write something" />
	<!-- <div>
		<button type="submit">send</button>
	</div> -->
</form>

<style>
	form {
		@apply w-full;
	}

	textarea {
		@apply border my-2 w-full h-12 rounded-md p-2;
	}

	div#messages {
		@apply border rounded-md h-80 w-full flex flex-col justify-end  overflow-y-scroll py-2;
	}

	div.message {
		@apply bg-sky-400 rounded-md w-80 px-4 py-2 my-2 mx-4;
	}

	.info {
		@apply text-sm text-gray-200;
	}
</style>
