<script lang="ts">
	import type { Message, User } from '$lib/types'
	import { onMount } from 'svelte'
	import io from '$lib/socketClient'
	import { fade } from 'svelte/transition'
	import { distanceFromNow } from '$lib/timeString'

	let userId = ''
	let username = ''
	let message = ''
	let command = ''
	let users: User[] = []

	let messages: Message[] = []

	onMount(() => {
		io.on('message', (message) => {
			message.time = new Date(message.time)
			messages = [...messages, message]
		})

		io.on('issueId', (id) => (userId = id))

		io.on('usernameUpdated', (newUsername) => {
			username = newUsername
		})

		io.on('updateUsers', (newUsers) => {
			users = newUsers
		})

		io.on('updateCommand', (newCommand) => {
			command = newCommand
			injectCommandToGame()
		})

		io.on('submitCommand', (submittedCommand) => {
			injectCommandToGame(submittedCommand)
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
		})
	})

	function messageKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) sendMessage()
	}

	function sendMessage() {
		message = message.trim()
		if (!message) return

		io.emit('message', { username, text: message })
		message = ''
	}

	let lineInput: HTMLInputElement
	function injectCommandToGame(commandText: string | undefined = undefined) {
		if (!lineInput) lineInput = document.getElementsByClassName('LineInput')[0] as HTMLInputElement

		if (lineInput) lineInput.value = commandText || command
	}

	function updateUsername() {
		io.emit('updateUsername', username)
	}

	function editCommand() {
		io.emit('editCommand', command)
	}

	function submitCommand(event: KeyboardEvent) {
		if (command && event.key === 'Enter') io.emit('submitCommand', command.trim())
	}
</script>

<h3>Chat</h3>
<div id="chat">
	<div id="messages">
		{#each messages as message, index (message)}
			<div class="message message-{index}" transition:fade|local={{ duration: 250 }}>
				<div class="info">
					{message.username || message.userId} - {distanceFromNow(message.time)}
				</div>
				<div class="message-text">{message.text}</div>
			</div>
		{/each}
	</div>

	<textarea placeholder="Chat" bind:value={message} on:keydown|stopPropagation={messageKeydown} />
	<div>
		<button on:click={sendMessage}>send</button>
		as
		<input
			type="text"
			bind:value={username}
			placeholder={userId}
			on:input={updateUsername}
			class="px-2 border rounded-md"
		/>
	</div>
</div>

{#each Object.values(users) as user (user.id)}
	<p>{user.username || user.id}</p>
{/each}

<div id="command">
	<h3>Command</h3>
	<textarea
		id="command"
		placeholder=">"
		bind:value={command}
		on:input|preventDefault={editCommand}
		on:keydown|stopPropagation={submitCommand}
	/>
</div>

<style>
	div.chat div.command {
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

	div.command {
	}

	.info {
		@apply text-sm text-gray-200;
	}
</style>
