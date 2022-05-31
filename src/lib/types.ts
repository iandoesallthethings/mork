export type UserId = number | string
export type Username = string

export interface User {
	id: UserId
	username: Username
}

export interface Message {
	userId: UserId
	username: Username
	time: Date
	text: string
}

export interface Command {
	userId: UserId
	text: string
}

export interface CommandQueue {
	[key: UserId]: Command
}
