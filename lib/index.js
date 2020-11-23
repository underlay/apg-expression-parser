"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
const n3_ts_1 = require("n3.ts");
const nearley_1 = __importDefault(require("nearley"));
const grammar_js_1 = __importDefault(require("../grammar.js"));
const g = nearley_1.default.Grammar.fromCompiled(grammar_js_1.default);
const xsd = "http://www.w3.org/2001/XMLSchema#";
function parse(input) {
    const parser = new nearley_1.default.Parser(g);
    parser.feed(input);
    if (Array.isArray(parser.results) && parser.results.length === 1) {
        const [statements] = parser.results;
        const prefixMap = new Map([["", xsd]]);
        const variables = new Map();
        const maps = new Map();
        for (const statement of statements) {
            if (statement.type === "prefix") {
                if (prefixMap.has(statement.key)) {
                    throw new Error(`Duplicate prefix name: ${statement.key}`);
                }
                else if (typeof statement.value === "string") {
                    prefixMap.set(statement.key, statement.value);
                }
                else {
                    const [prefix, value] = statement.value;
                    const base = prefixMap.get(prefix);
                    if (base !== undefined) {
                        prefixMap.set(statement.key, base + value);
                    }
                    else {
                        throw new Error(`Undefined prefix: ${prefix}`);
                    }
                }
            }
            else if (statement.type === "variable") {
                if (variables.has(statement.key)) {
                    throw new Error(`Duplicate expression name: ${statement.key}`);
                }
                else {
                    const expressions = statement.value.flatMap((expr) => parseExpression(prefixMap, variables, expr));
                    Object.freeze(expressions);
                    variables.set(statement.key, expressions);
                }
            }
            else if (statement.type === "map") {
                const key = parseURI(prefixMap, statement.key);
                const source = parseURI(prefixMap, statement.source);
                const target = statement.target.map(({ type, key }) => Object.freeze({ type, key: parseURI(prefixMap, key) }));
                const map = {
                    type: "map",
                    key,
                    source,
                    target,
                    value: statement.value.flatMap((v) => parseExpression(prefixMap, variables, v)),
                };
                Object.freeze(map);
                maps.set(key, map);
            }
        }
        const mapping = Array.from(maps.values());
        mapping.sort(({ key: a }, { key: b }) => (a < b ? -1 : b < a ? 1 : 0));
        Object.freeze(mapping);
        return mapping;
    }
    else {
        console.error(parser.results);
        throw new Error("Internal error: ambiguous parser result");
    }
}
exports.parse = parse;
function parseExpression(prefixes, variables, expr) {
    if (expr.type === "variable") {
        const value = variables.get(expr.value);
        if (value === undefined) {
            throw new Error(`Expression ${expr.value} is not defined`);
        }
        return value;
    }
    else if (expr.type === "identity") {
        Object.freeze(expr);
        return [expr];
    }
    else if (expr.type === "terminal") {
        Object.freeze(expr);
        return [expr];
    }
    else if (expr.type === "identifier") {
        const identifier = {
            type: "identifier",
            value: new n3_ts_1.NamedNode(parseURI(prefixes, expr.value)),
        };
        Object.freeze(identifier);
        return [identifier];
    }
    else if (expr.type === "constant") {
        const datatype = new n3_ts_1.NamedNode(parseURI(prefixes, expr.datatype));
        const value = new n3_ts_1.Literal(expr.value, "", datatype);
        const constant = { type: "constant", value };
        Object.freeze(constant);
        return [constant];
    }
    else if (expr.type === "dereference") {
        const dereference = {
            type: "dereference",
            key: parseURI(prefixes, expr.key),
        };
        Object.freeze(dereference);
        return [dereference];
    }
    else if (expr.type === "projection") {
        const projection = {
            type: "projection",
            key: parseURI(prefixes, expr.key),
        };
        Object.freeze(projection);
        return [projection];
    }
    else if (expr.type === "injection") {
        const injection = {
            type: "injection",
            key: parseURI(prefixes, expr.key),
            value: expr.value.flatMap((v) => parseExpression(prefixes, variables, v)),
        };
        Object.freeze(injection);
        return [injection];
    }
    else if (expr.type === "tuple") {
        const keys = new Set();
        const slots = [];
        for (const s of expr.slots) {
            const key = parseURI(prefixes, s.key);
            if (keys.has(key)) {
                throw new Error(`Duplicate tuple slot key: ${key}`);
            }
            keys.add(key);
            const value = s.value.flatMap((v) => parseExpression(prefixes, variables, v));
            slots.push(Object.freeze({ type: "slot", key, value }));
        }
        slots.sort(({ key: a }, { key: b }) => (a < b ? -1 : b < a ? 1 : 0));
        Object.freeze(slots);
        const tuple = { type: "tuple", slots };
        Object.freeze(tuple);
        return [tuple];
    }
    else if (expr.type === "match") {
        const keys = new Set();
        const cases = [];
        for (const c of expr.cases) {
            const key = parseURI(prefixes, c.key);
            if (keys.has(key)) {
                throw new Error(`Duplicate match case key: ${key}`);
            }
            keys.add(key);
            const value = c.value.flatMap((v) => parseExpression(prefixes, variables, v));
            cases.push(Object.freeze({ type: "case", key, value }));
        }
        cases.sort(({ key: a }, { key: b }) => (a < b ? -1 : b < a ? 1 : 0));
        Object.freeze(cases);
        const match = { type: "match", cases };
        Object.freeze(match);
        return [match];
    }
    else {
        console.error(expr);
        throw new Error("Invalid expression type");
    }
}
function parseURI(prefixes, uri) {
    if (typeof uri === "string") {
        return uri;
    }
    const [prefix, value] = uri;
    const base = prefixes.get(prefix);
    if (base === undefined) {
        throw new Error(`Undefined prefix: ${prefix}`);
    }
    return base + value;
}
//# sourceMappingURL=index.js.map