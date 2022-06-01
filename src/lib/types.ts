export type UserId = number | string
export type Username = string

export interface User {
	id: UserId
	username: Username
	isTyping: boolean
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

export type HtmlString = string
