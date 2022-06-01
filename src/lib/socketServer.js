import { Server } from 'socket.io'

function randomRange(min, max) {
	return Math.random() * (max - min) + min
}

function randomInt(min, max) {
	return Math.floor(randomRange(min, max))
}

export function configureWebsocket(server) {
	const io = new Server(server.httpServer)

	// Game state
	const users = {}
	let command = ''
	let gameHtml = ''

	io.on('connection', (socket) => {
		// userState
		let userId
		let username

		createUser()

		// Events
		socket.on('updateUsername', updateUsername)
		socket.on('message', broadcastMessage)
		socket.on('editCommand', editCommand)
		socket.on('submitCommand', submitCommand)
		socket.on('disconnect', leaveGame)
		socket.on('isTyping', isTyping)
		socket.on('gameUpdate', updateGame)

		function createUser() {
			userId = 'User' + randomInt(100, 999)
			username = ''

			users[userId] = { id: userId, username, isTyping: false }
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

		function isTyping(userIsTyping) {
			users[userId].isTyping = userIsTyping
			updateUsers()
		}

		function broadcastMessage(message) {
			username = message.username || ''
			io.emit('message', { userId, username, time: new Date(), text: message.text })
		}

		function updateGame(newGameHtml) {
			gameHtml = newGameHtml
			io.emit('updateGame', gameHtml)
		}

		function leaveGame(reason) {
			delete users[userId]
			updateUsers()
			console.log(`${username} left the game: ${reason}`)
		}
	})
}
