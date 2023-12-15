import { test } from 'node:test'
import assert from 'node:assert'
import { invariant, invariantResponse, invariantJsonResponse } from '../src'

test('invariant should not throw an error for a true condition', () => {
	const creature = { name: 'Dragon', type: 'Fire' }
	assert.doesNotThrow(() => {
		invariant(creature.name === 'Dragon', 'Creature must be a Dragon')
	})
})

test('invariant should throw an error for a false condition', () => {
	const creature = { name: 'Unicorn', type: 'Magic' }
	assert.throws(() => {
		invariant(creature.type === 'Fire', 'Creature must be of type Fire')
	}, /Creature must be of type Fire/)
})

test('invariant message can be a callback as an optimization', () => {
	const creature = { name: 'Elf', type: 'Forest' }
	assert.throws(() => {
		invariant(creature.type === 'Water', () => 'Creature must be of type Water')
	}, /Creature must be of type Water/)
})

test('invariantResponse should not throw a Response for a true condition', () => {
	const creature = { name: 'Phoenix', type: 'Fire' }
	assert.doesNotThrow(() => {
		invariantResponse(creature.type === 'Fire', 'Creature must be of type Fire')
	})
})

test('invariantResponse should throw a Response for a false condition', async () => {
	const creature = { name: 'Griffin', type: 'Air' }
	try {
		invariantResponse(
			creature.type === 'Water',
			'Creature must be of type Water',
		)
		assert.fail('Expected to throw a Response')
	} catch (error: unknown) {
		invariant(error instanceof Response, 'Expected to throw a Response')
		assert.strictEqual(error.status, 400)
		assert.strictEqual(await error.text(), 'Creature must be of type Water')
	}
})

test('invariantResponse message can be a callback as an optimization', async () => {
	const creature = { name: 'Mermaid', type: 'Water' }
	try {
		invariantResponse(
			creature.type === 'Land',
			() => `Expected a Land creature, but got a ${creature.type} creature`,
		)
		assert.fail('Expected to throw a Response')
	} catch (error: unknown) {
		invariant(error instanceof Response, 'Expected to throw a Response')
		assert.strictEqual(error.status, 400)
		assert.strictEqual(
			await error.text(),
			`Expected a Land creature, but got a ${creature.type} creature`,
		)
	}
})

test('invariantResponse should throw a Response with additional responseInit options for a false condition', async () => {
	const creature = { name: 'Cerberus', type: 'Underworld' }
	try {
		invariantResponse(
			creature.type === 'Sky',
			JSON.stringify({ error: 'Creature must be of type Sky' }),
			{ status: 500, headers: { 'Content-Type': 'text/json' } },
		)
		assert.fail(
			'Expected to throw a Response with additional responseInit options',
		)
	} catch (error: unknown) {
		invariant(error instanceof Response, 'Expected to throw a Response')
		assert.strictEqual(error.status, 500)
		assert.deepStrictEqual(await error.json(), {
			error: 'Creature must be of type Sky',
		})
		assert.strictEqual(error.headers.get('Content-Type'), 'text/json')
	}
})

test('invariantJsonResponse should not throw a Response for a true condition', () => {
	assert.doesNotThrow(() => {
		invariantJsonResponse(true, 'Falsy value')
	})
})

test('invariantJsonResponse should throw a Response for a false condition with JSON content type', async () => {
	const errorMessage = 'Falsy value'
	try {
		invariantJsonResponse(false, errorMessage)
	} catch (error: unknown) {
		invariant(error instanceof Response, 'Expected to throw a Response')
		assert.strictEqual(error.status, 400)
		assert.strictEqual(
			JSON.stringify(await error.json()),
			JSON.stringify({
				error: errorMessage,
			}),
		)
		assert.strictEqual(error.headers.get('content-type'), 'text/json')
	}
})

test('invariantJsonResponse can throw a Response with status different from 400', async () => {
	try {
		invariantJsonResponse(false, 'Error message', 500)
	} catch (error: unknown) {
		invariant(error instanceof Response, 'Expected to throw a Response')
		assert.strictEqual(error.status, 500)
	}
})
