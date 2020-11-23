import { APG } from "@underlay/apg"
import { Literal, NamedNode } from "n3.ts"

import nearley from "nearley"
import grammar, { Expression, Statement, URI } from "../grammar.js"

const g = nearley.Grammar.fromCompiled(grammar)

const xsd = "http://www.w3.org/2001/XMLSchema#"

export function parse(input: string): APG.Mapping {
	const parser = new nearley.Parser(g)
	parser.feed(input)

	if (Array.isArray(parser.results) && parser.results.length === 1) {
		const [statements] = parser.results as Statement[][]
		const prefixMap = new Map<string, string>([["", xsd]])
		const variables = new Map<string, APG.Expression[]>()
		const maps = new Map()
		for (const statement of statements) {
			if (statement.type === "prefix") {
				if (prefixMap.has(statement.key)) {
					throw new Error(`Duplicate prefix name: ${statement.key}`)
				} else if (typeof statement.value === "string") {
					prefixMap.set(statement.key, statement.value)
				} else {
					const [prefix, value] = statement.value
					const base = prefixMap.get(prefix)
					if (base !== undefined) {
						prefixMap.set(statement.key, base + value)
					} else {
						throw new Error(`Undefined prefix: ${prefix}`)
					}
				}
			} else if (statement.type === "variable") {
				if (variables.has(statement.key)) {
					throw new Error(`Duplicate expression name: ${statement.key}`)
				} else {
					const expressions = statement.value.flatMap((expr) =>
						parseExpression(prefixMap, variables, expr)
					)
					Object.freeze(expressions)
					variables.set(statement.key, expressions)
				}
			} else if (statement.type === "map") {
				const key = parseURI(prefixMap, statement.key)
				const source = parseURI(prefixMap, statement.source)

				const target: APG.Path = statement.target.map(({ type, key }) =>
					Object.freeze({ type, key: parseURI(prefixMap, key) })
				)
				const map: APG.Map = {
					type: "map",
					key,
					source,
					target,
					value: statement.value.flatMap((v) =>
						parseExpression(prefixMap, variables, v)
					),
				}
				Object.freeze(map)
				maps.set(key, map)
			}
		}

		const mapping: APG.Map[] = Array.from(maps.values())
		mapping.sort(({ key: a }, { key: b }) => (a < b ? -1 : b < a ? 1 : 0))
		Object.freeze(mapping)
		return mapping
	} else {
		console.error(parser.results)
		throw new Error("Internal error: ambiguous parser result")
	}
}

function parseExpression(
	prefixes: Map<string, string>,
	variables: Map<string, APG.Expression[]>,
	expr: Expression
): APG.Expression[] {
	if (expr.type === "variable") {
		const value = variables.get(expr.value)
		if (value === undefined) {
			throw new Error(`Expression ${expr.value} is not defined`)
		}
		return value
	} else if (expr.type === "identity") {
		Object.freeze(expr)
		return [expr]
	} else if (expr.type === "terminal") {
		Object.freeze(expr)
		return [expr]
	} else if (expr.type === "identifier") {
		const identifier: APG.Identifier = {
			type: "identifier",
			value: new NamedNode(parseURI(prefixes, expr.value)),
		}
		Object.freeze(identifier)
		return [identifier]
	} else if (expr.type === "constant") {
		const datatype = new NamedNode(parseURI(prefixes, expr.datatype))
		const value = new Literal(expr.value, "", datatype)
		const constant: APG.Constant = { type: "constant", value }
		Object.freeze(constant)
		return [constant]
	} else if (expr.type === "dereference") {
		const dereference: APG.Dereference = {
			type: "dereference",
			key: parseURI(prefixes, expr.key),
		}
		Object.freeze(dereference)
		return [dereference]
	} else if (expr.type === "projection") {
		const projection: APG.Projection = {
			type: "projection",
			key: parseURI(prefixes, expr.key),
		}
		Object.freeze(projection)
		return [projection]
	} else if (expr.type === "injection") {
		const injection: APG.Injection = {
			type: "injection",
			key: parseURI(prefixes, expr.key),
			value: expr.value.flatMap((v) => parseExpression(prefixes, variables, v)),
		}
		Object.freeze(injection)
		return [injection]
	} else if (expr.type === "tuple") {
		const keys = new Set()
		const slots: APG.Slot[] = []
		for (const s of expr.slots) {
			const key = parseURI(prefixes, s.key)
			if (keys.has(key)) {
				throw new Error(`Duplicate tuple slot key: ${key}`)
			}

			keys.add(key)

			const value = s.value.flatMap((v) =>
				parseExpression(prefixes, variables, v)
			)

			slots.push(Object.freeze({ type: "slot", key, value }))
		}

		slots.sort(({ key: a }, { key: b }) => (a < b ? -1 : b < a ? 1 : 0))
		Object.freeze(slots)

		const tuple: APG.Tuple = { type: "tuple", slots }
		Object.freeze(tuple)
		return [tuple]
	} else if (expr.type === "match") {
		const keys = new Set()
		const cases: APG.Case[] = []
		for (const c of expr.cases) {
			const key = parseURI(prefixes, c.key)
			if (keys.has(key)) {
				throw new Error(`Duplicate match case key: ${key}`)
			}

			keys.add(key)

			const value = c.value.flatMap((v) =>
				parseExpression(prefixes, variables, v)
			)

			cases.push(Object.freeze({ type: "case", key, value }))
		}

		cases.sort(({ key: a }, { key: b }) => (a < b ? -1 : b < a ? 1 : 0))
		Object.freeze(cases)

		const match: APG.Match = { type: "match", cases }
		Object.freeze(match)
		return [match]
	} else {
		console.error(expr)
		throw new Error("Invalid expression type")
	}
}

function parseURI(prefixes: Map<string, string>, uri: URI): string {
	if (typeof uri === "string") {
		return uri
	}

	const [prefix, value] = uri
	const base = prefixes.get(prefix)
	if (base === undefined) {
		throw new Error(`Undefined prefix: ${prefix}`)
	}
	return base + value
}
