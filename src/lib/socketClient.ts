import { io as ioClient } from 'socket.io-client'

const endpoint = 'http://localhost:3000'
export default ioClient(endpoint)
