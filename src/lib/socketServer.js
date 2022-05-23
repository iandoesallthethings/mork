import { Server } from 'socket.io'

export function configureWebsocket(server) {
	const io = new Server(server.httpServer)

	const commands = {}

	io.on('connection', (socket) => {
		const userId = 'User' + Math.round(Math.random() * 999999)
		let username = ''
		commands[userId] = ''
		console.log(`${userId} joined the game!`)
		socket.emit('name', userId)

		socket.on('message', broadcastMessage)
		socket.on('queueCommand', queueCommand)
		socket.on('disconnect', leaveGame)

		function broadcastMessage(message) {
			username = message.username || ''

			io.emit('message', { userId, username, time: new Date(), text: message.text })
		}

		function queueCommand(command) {
			const id = command.userId
			commands[id] = command.text

			io.emit('commands', commands)
		}

		function leaveGame(reason) {
			delete commands[userId]
			io.emit('commands', commands)
			console.log(`${username} left the game: ${reason}`)
		}
	})
}
