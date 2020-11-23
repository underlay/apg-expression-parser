import nearley from "nearley"

declare const grammar: nearley.CompiledRules
export default grammar

export type URI = string | [string, string]
export type Expression =
	| { type: "variable"; value: string }
	| { type: "identity" }
	| { type: "terminal" }
	| { type: "identifier"; value: URI }
	| { type: "constant"; value: string; datatype: URI }
	| { type: "dereference"; key: URI }
	| { type: "projection"; key: URI }
	| { type: "injection"; key: URI; value: Expression[] }
	| { type: "tuple"; slots: { type: "slot"; key: URI; value: Expression[] }[] }
	| { type: "match"; cases: { type: "case"; key: URI; value: Expression[] }[] }

export type Statement =
	| { type: "prefix"; key: string; value: URI }
	| { type: "variable"; key: string; value: Expression[] }
	| {
			type: "map"
			key: URI
			source: URI
			target: { type: "component" | "option"; key: URI }[]
			value: Expression[]
	  }
