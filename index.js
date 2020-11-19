const nearley = require("nearley")
const grammar = require("./grammar.js")

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar))

const xsd = "http://www.w3.org/2001/XMLSchema#"

module.exports = (input) => {
	const { results } = parser.feed(input)
	if (Array.isArray(results) && results.length === 1) {
		const [{ prefixes, expressions, map }] = results
		const prefixMap = new Map([["", xsd]])
		for (const [key, value] of prefixes) {
			if (prefixMap.has(key)) {
				throw new Error(`Duplicate prefix name: ${key}`)
			} else {
				prefixMap.set(key, value)
			}
		}

		const variables = new Map()
		for (const [key, value] of expressions) {
			if (variables.has(key)) {
				throw new Error(`Duplicate expression name: ${key}`)
			} else {
				const expressions = value.flatMap((expr) =>
					parseExpression(prefixMap, variables, expr)
				)
				Object.freeze(expressions)
				variables.set(key, expressions)
			}
		}

		const keys = new Set()
		for (const link of map) {
			link.source = parsePrefix(prefixMap, link.source)
			link.key = parsePrefix(prefixMap, link.key)
			if (keys.has(link.key)) {
				throw new Error(`Duplicate map key: ${link.key}`)
			}

			keys.add(link.key)

			for (const element of link.target) {
				element.value = parsePrefix(prefixMap, element.value)
				Object.freeze(element)
			}
			Object.freeze(link.target)

			link.value = link.value.flatMap((expr) =>
				parseExpression(prefixMap, variables, expr)
			)
			Object.freeze(link.value)

			Object.freeze(link)
		}

		return Object.freeze(
			map.sort(({ key: a }, { key: b }) => (a < b ? -1 : b < a ? 1 : 0))
		)
	} else {
		console.error(result)
		throw new Error("Internal error: ambiguous parser result")
	}
}

function parseExpression(prefixes, variables, expr) {
	if (expr.type === "variable") {
		const variable = variables.get(expr.value)
		if (variable === undefined) {
			throw new Error(`Expression ${expr.value} is not defined`)
		}
		return variable
	} else if (expr.type === "identifier") {
		expr.value = parsePrefix(prefixes, expr.value)
	} else if (expr.type === "constant") {
		expr.datatype = parsePrefix(prefixes, expr.datatype)
	} else if (expr.type === "dereference") {
		expr.key = parsePrefix(prefixes, expr.key)
	} else if (expr.type === "projection") {
		expr.key = parsePrefix(prefixes, expr.key)
	} else if (expr.type === "injection") {
		expr.key = parsePrefix(prefixes, expr.key)
		expr.value = expr.value.flatMap((v) =>
			parseExpression(prefixes, variables, v)
		)
		Object.freeze(expr.value)
	} else if (expr.type === "tuple") {
		const keys = new Set()
		for (const s of expr.slots) {
			s.key = parsePrefix(prefixes, s.key)
			if (keys.has(s.key)) {
				throw new Error(`Duplicate tuple slot key: ${s.key}`)
			}

			keys.add(s.key)
			s.value = s.value.flatMap((v) => parseExpression(prefixes, variables, v))
			Object.freeze(s.value)
			Object.freeze(s)
		}
		Object.freeze(expr.slots)
	} else if (expr.type === "match") {
		const keys = new Set()
		for (const c of expr.cases) {
			c.key = parsePrefix(prefixes, c.key)
			if (keys.has(c.key)) {
				throw new Error(`Duplicate match case key: ${c.key}`)
			}

			keys.add(c.key)
			c.value = c.value.flatMap((v) => parseExpression(prefixes, variables, v))
			Object.freeze(c.value)
			Object.freeze(c)
		}
		Object.freeze(expr.cases)
	}
	Object.freeze(expr)
	return [expr]
}

const prefixPattern = /^([a-z]*):/

function parsePrefix(prefixes, uri) {
	const match = prefixPattern.exec(uri)
	if (match !== null) {
		const [{}, prefix] = match
		if (prefixes.has(prefix)) {
			return prefixes.get(prefix) + uri.slice(prefix.length + 1)
		}
	}

	return uri
}

// parser.results is an array of possible parsings.
console.log(parser.results) // [[[[ "foo" ],"\n" ]]]
