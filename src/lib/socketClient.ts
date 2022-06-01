import { io as ioClient } from 'socket.io-client'
import { browser } from '$app/env'

const endpoint = 'http://localhost:3000'

const fakeSocket = {
	on: (args: unknown) => console.warn('No socket connection.'),
	emit: (args: unknown) => console.warn('No socket connection.')
}

export default browser ? ioClient(endpoint) : fakeSocket
