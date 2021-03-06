<script lang="ts">
	import type { Message, User } from '$lib/types'
	import { onMount } from 'svelte'
	import io from '$lib/socketClient'
	import { fade } from 'svelte/transition'
	import { distanceFromNow } from '$lib/timeString'
	import debouncedEvent from '$lib/debouncedEvent'

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
			command = submittedCommand.trim()
			injectCommandToGame(command)
			console.debug('dispaching')
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
		})
	})
	let dummyElement: HTMLDivElement

	function startTyping() {
		io.emit('isTyping', true)
	}

	function stopTyping() {
		io.emit('isTyping', false)
	}

	function messageKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			sendMessage()
		} else if (!users[userId].isTyping) startTyping()
	}

	function sendMessage() {
		message = message.trim()
		if (!message) return

		stopTyping()
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

	function submitCommandIfEnter(event: KeyboardEvent) {
		if (command && event.key === 'Enter') {
			event.preventDefault()
			io.emit('submitCommand', command.trim())
		}
	}
</script>

<div bind:this={dummyElement} />

<h3>Chat</h3>
<div id="chat">
	<div id="messages">
		{#each messages as message, index (message)}
			<div
				class="message message-{index}"
				class:current-user={message.userId === userId}
				transition:fade|local={{ duration: 250 }}
			>
				<div class="info">
					{message.username || message.userId} - {distanceFromNow(message.time)}
				</div>
				<div class="message-text">{message.text}</div>
			</div>
		{/each}
	</div>

	<textarea
		placeholder="Chat"
		bind:value={message}
		use:debouncedEvent={{ eventType: 'input', debounceTime: 375 }}
		on:debounced-input={stopTyping}
		on:keydown|stopPropagation={messageKeydown}
	/>
	<div>
		<button on:click={sendMessage}>send</button>
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
</div>

{#each Object.values(users) as user (user.id)}
	<p class="flex space-x-2 justify-end">
		<span>
			{user.username || user.id}
		</span>
		<span class="w-4">
			{#if user.isTyping}💭{/if}
		</span>
	</p>
{/each}

<div id="command">
	<h3>Command</h3>
	<textarea
		id="command"
		placeholder=">"
		bind:value={command}
		on:input|preventDefault={editCommand}
		on:keydown|stopPropagation={submitCommandIfEnter}
	/>
</div>

<style>
	#chat,
	#command {
		@apply w-full;
	}

	input,
	textarea {
		@apply bg-transparent placeholder-gray-400;
	}

	textarea {
		@apply border my-2 w-full rounded-md p-2;
	}

	textarea#command {
		@apply h-12;
	}
	textarea#message {
		@apply h-20;
	}

	textarea#command::before {
		content: '>';
	}

	#messages {
		@apply border rounded-md h-44 w-full max-w-full flex flex-col justify-end overflow-y-scroll p-2;
	}

	.message {
		@apply bg-sky-400 rounded-md max-w-full px-4 py-2 my-2 mx-4 self-start;
	}

	.message.current-user {
		@apply self-end bg-red-400;
	}

	.info {
		@apply text-sm text-gray-200;
	}
</style>
