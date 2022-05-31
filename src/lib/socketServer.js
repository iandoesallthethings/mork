import { Server } from 'socket.io'

export function configureWebsocket(server) {
	const io = new Server(server.httpServer)

	// Game state
	const users = {}
	let command = ''

	io.on('connection', (socket) => {
		// userState
		let userId = 'User' + Math.round(Math.random() * 999999)
		let username

		createUser()

		// Events
		socket.on('updateUsername', updateUsername)
		socket.on('message', broadcastMessage)
		socket.on('editCommand', editCommand)
		socket.on('submitCommand', submitCommand)
		socket.on('disconnect', leaveGame)

		function createUser() {
			userId = 'User' + Math.round(Math.random() * 999999)
			username = ''

			users[userId] = { id: userId, username }
			socket.emit('issueId', userId)
			console.log(`${userId} joined the game!`)
			updateUsers()
		}

		function updateUsername(newUsername) {
			username = newUsername
			users[userId].username = newUsername
			updateUsers()
		}

		function updateUsers() {
			io.emit('updateUsers', users)
		}

		function editCommand(newCommand) {
			command = newCommand
			io.emit('updateCommand', command)
		}

		function submitCommand(submittedCommand) {
			command = submittedCommand
			io.emit('submitCommand', command)
			editCommand('')
		}

		function broadcastMessage(message) {
			username = message.username || ''
			io.emit('message', { userId, username, time: new Date(), text: message.text })
		}

		function leaveGame(reason) {
			delete users[userId]
			updateUsers()
			console.log(`${username} left the game: ${reason}`)
		}
	})
}
