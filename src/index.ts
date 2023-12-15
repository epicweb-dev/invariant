export class InvariantError extends Error {
	constructor(message: string) {
		super(message)
		Object.setPrototypeOf(this, InvariantError.prototype)
	}
}
/**
 * Provide a condition and if that condition is falsey, this throws an error
 * with the given message.
 *
 * inspired by invariant from 'tiny-invariant' except will still include the
 * message in production.
 *
 * @example
 * invariant(typeof value === 'string', `value must be a string`)
 *
 * @param condition The condition to check
 * @param message The message to throw (or a callback to generate the message)
 *
 * @throws {InvariantError} if condition is falsey
 */
export function invariant(
	condition: any,
	message: string | (() => string),
): asserts condition {
	if (!condition) {
		throw new InvariantError(
			typeof message === 'function' ? message() : message,
		)
	}
}

/**
 * Provide a condition and if that condition is falsey, this throws a 400
 * Response with the given message.
 *
 * @example
 * const creature = { name: 'Cerberus', type: 'Underworld' }
 * invariantResponse(
 *  creature.type === 'Sky',
 *  JSON.stringify({ error: 'Creature must be of type Sky' }),
 *  { status: 500, headers: { 'Content-Type': 'text/json' } },
 * )
 *
 * @param condition The condition to check
 * @param message The message to throw (or a callback to generate the message)
 * @param responseInit Additional response init options if a response is thrown
 *
 * @throws {Response} if condition is falsey
 */
export function invariantResponse(
	condition: any,
	message: string | (() => string),
	responseInit?: ResponseInit,
): asserts condition {
	if (!condition) {
		throw new Response(typeof message === 'function' ? message() : message, {
			status: 400,
			...responseInit,
		})
	}
}

/**
 * invariantResponse alias with defaults for convenience and to avoid boilerplate
 *
 * @examples
 * invariantJsonResponse(typeof value === 'string', 'value must be a string')
 * invariantJsonResponse(typeof value === 'string', 'value must be a string', 500)
 *
 * @param condition The condition to check
 * @param message The message to throw
 * @param status optional status code if different from 400
 *
 * @throws {Response} if condition is falsey
 */
export function invariantJsonResponse(
	condition: any,
	message: string,
	status?: number,
): asserts condition {
	return invariantResponse(condition, JSON.stringify({ error: message }), {
		status: status || 400,
		headers: {
			'Content-Type': 'text/json',
		},
	})
}
