import debounce from 'lodash.debounce'

export interface ActionEventListeners {
	update?: (parameters: any) => void
	destroy?: () => void
}

interface DebouncedEventOptions {
	eventType?: string
	debounceTime?: number
}

export default function debouncedEvent(
	node: HTMLElement,
	options: DebouncedEventOptions
): ActionEventListeners {
	const { eventType = 'input', debounceTime = 300 } = options

	const debouncedEventType = 'debounced-' + eventType

	function dispatchCustomEvent(originalEvent: Event): void {
		const event = new CustomEvent(debouncedEventType, {
			detail: { originalEvent }
		})
		node.dispatchEvent(event)
	}

	const debouncedDispatch = debounce(dispatchCustomEvent, debounceTime)
	node.addEventListener(eventType, debouncedDispatch)

	return {
		destroy() {
			node.removeEventListener(eventType, debouncedDispatch)
		}
	}
}
