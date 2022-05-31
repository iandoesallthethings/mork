<script lang="ts">
	import type { Message, Command, CommandQueue } from '$lib/types'
	import { onMount } from 'svelte'
	import io from '$lib/socketClient'
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
		// io.on('')
	})

	function sendMessage() {
		messageText = messageText.trim()
		if (!messageText) return

		io.emit('message', { username, text: messageText })
		messageText = ''
	}

	function submitCommand() {
		if (!commandText) return
		io.emit('command', { text: commandText.trim() })
		commandText = ''
	}

	let lineInput: Element

	function queueCommand() {
		if (!lineInput) lineInput = document.getElementsByClassName('LineInput')[0]
		else lineInput.value = commandText
		io.emit('queueCommand', { text: commandText.trim() })
	}

	function updateUsername() {
		io.emit('username', username)
	}

	function submitCommandIfKeyIsEnter(event: KeyboardEvent) {
		if (event.key !== 'Enter') return event.stopPropagation()
		submitCommand()
	}
</script>

<h3>Chat</h3>
<div id="messages">
	{#each messages as message, index (message)}
		<div class="message message-{index}" transition:fade|local={{ duration: 250 }}>
			<div class="info">{message.username || message.userId} - {distanceFromNow(message.time)}</div>
			<div class="message-text">{message.text}</div>
		</div>
	{/each}
</div>

<form action="#" on:submit|preventDefault={sendMessage}>
	<textarea bind:value={messageText} placeholder="Chat" on:keydown|stopPropagation />
	<div>
		<button type="submit">send</button>
		as
		<input
			type="text"
			bind:value={username}
			placeholder={userId}
			on:input={updateUsername}
			on:keydown|stopPropagation
			class="px-2 border rounded-md"
		/>
	</div>
</form>

<h3>Commands</h3>
<div id="commandQueue">
	{#each Object.entries(commands) as [userId, command]}
		<div class="command">{command.username || command.userId}: {command.text}</div>
	{/each}
</div>

<form
	action="#"
	on:submit|preventDefault={submitCommand}
	on:input|preventDefault={queueCommand}
	on:keydown={submitCommandIfKeyIsEnter}
>
	<textarea id="command" bind:value={commandText} placeholder="Command" />
</form>

<style>
	form {
		@apply w-full;
	}

	input,
	textarea {
		@apply bg-transparent placeholder-gray-400;
	}

	textarea {
		@apply border my-2 w-full h-12 rounded-md p-2;
	}

	textarea#command::before {
		content: '>';
	}

	div#messages {
		@apply border rounded-md h-44 w-full flex flex-col justify-end overflow-y-scroll py-2;
	}

	div.message {
		@apply bg-sky-400 rounded-md w-80 px-4 py-2 my-2 mx-4;
	}

	div#commandQueue {
		@apply border rounded-md h-20 w-full flex flex-col justify-end overflow-y-scroll p-2;
	}

	div.command {
	}

	.info {
		@apply text-sm text-gray-200;
	}
</style>
