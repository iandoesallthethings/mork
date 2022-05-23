const second = 1000 // milliseconds
const minute = 60 * second
const hour = 60 * minute
const day = 24 * hour
const week = 7 * day
const month = 30 * day
const year = 365 * day

type NumberOfMilliseconds = number

export function distanceFromNow(date: Date): string {
	date = new Date(date)
	const now = new Date()
	const distance = now.getTime() - date.getTime()

	if (distance >= year) return twoCharString(distance, year, 'y')
	else if (distance >= month) return twoCharString(distance, month, 'm')
	else if (distance >= week) return twoCharString(distance, week, 'w')
	else if (distance >= day) return twoCharString(distance, day, 'd')
	else if (distance >= hour) return twoCharString(distance, hour, 'h')
	else if (distance >= minute) return twoCharString(distance, minute, 'm')
	else if (distance >= second) return twoCharString(distance, second, 's')
	else if (distance < second) return 'just now'
	else return ''
}

function twoCharString(
	milliseconds: NumberOfMilliseconds,
	unit: NumberOfMilliseconds,
	unitCharacter: string
): string {
	// const [unitName] = Object.keys({unitInMilliseconds})
	const quantity = Math.floor(milliseconds / unit) || 1 // In case we want to cut days off at 9 days or whatever
	return quantity + unitCharacter
}
