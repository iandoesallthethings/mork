import { Server } from 'socket.io'

export function configureWebsocket(server) {
	const io = new Server(server.httpServer)

	const commands = {}

	io.on('connection', (socket) => {
		const userId = 'User' + Math.round(Math.random() * 999999)
		let username = ''

		commands[userId] = { userId, username: '', text: '' }
		socket.emit('name', userId)

		console.log(`${userId} joined the game!`)

		refreshCommands()

		socket.on('username', updateUsername)
		socket.on('message', broadcastMessage)
		socket.on('queueCommand', queueCommand)
		socket.on('disconnect', leaveGame)

		function updateUsername(newUsername) {
			username = newUsername
			commands[userId].username = newUsername
			refreshCommands()
		}

		function refreshCommands() {
			io.emit('commands', commands)
		}

		function broadcastMessage(message) {
			username = message.username || ''

			io.emit('message', { userId, username, time: new Date(), text: message.text })
		}

		function queueCommand(command) {
			commands[userId] = { userId, username, text: command.text }
			refreshCommands()
		}

		function leaveGame(reason) {
			delete commands[userId]
			refreshCommands()
			console.log(`${username} left the game: ${reason}`)
		}
	})
}
