// Generated automatically by nearley, version 2.19.8
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

const moo = require("moo");

const nil = () => null;

const lexer = moo.compile({
  ws:       { match: /\s+/, lineBreaks: true, value: nil },
  comment:  { match: /#.*?$/, value: nil },
  string:   /"(?:\\(?:["\\bfnrt]|u[a-fA-F0-9]{4})|[^"\\\n])*"/,
  lparen:   '(',
  rparen:   ')',
  lbrace:   '{',
  rbrace:   '}',
  lbracket: '[',
  rbracket: ']',
  larrow:   '<-',
  rarrow:   '->',
  ldarrow:  '<=',
  rdarrow:  '=>',
  unit:     '!',
  identity: '@',
  modulo:   '%',
  slash:    '/',
  bslash:   '\\',
  dot:      '.',
  pointer:  '*',
  equal:    '=',
  delim:    ';',
  ref:      /(?:[a-zA-Z][a-zA-Z0-9]*)?:[a-zA-Z0-9-/_.:#]+/,
  uri:      /<[a-z]+:[a-zA-Z0-9-/_.:#]+>/,
  name:     {
    match: /[a-zA-Z][a-zA-Z0-9]*/,
    type: moo.keywords(Object.fromEntries(["prefix", "expr", "map"].map(k => ["kw_" + k, k])))
  },
});
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "main$ebnf$1$subexpression$1", "symbols": ["statements", "_"], "postprocess": ([s]) => s},
    {"name": "main$ebnf$1", "symbols": ["main$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "main$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "main", "symbols": ["_", "main$ebnf$1"], "postprocess": ([_, s]) => s || []},
    {"name": "statements$ebnf$1", "symbols": []},
    {"name": "statements$ebnf$1$subexpression$1", "symbols": ["__", "statement"], "postprocess": ([_, s]) => s},
    {"name": "statements$ebnf$1", "symbols": ["statements$ebnf$1", "statements$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "statements", "symbols": ["statement", "statements$ebnf$1"], "postprocess": ([first, rest]) => [first, ...rest]},
    {"name": "statement$subexpression$1", "symbols": ["prefix"]},
    {"name": "statement$subexpression$1", "symbols": ["variable"]},
    {"name": "statement$subexpression$1", "symbols": ["map"]},
    {"name": "statement", "symbols": ["statement$subexpression$1"], "postprocess": ([[s]]) => s},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1$subexpression$1", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "_$ebnf$1$subexpression$1", "symbols": [(lexer.has("comment") ? {type: "comment"} : comment)]},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "_$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": () => null},
    {"name": "__$ebnf$1$subexpression$1", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "__$ebnf$1$subexpression$1", "symbols": [(lexer.has("comment") ? {type: "comment"} : comment)]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1$subexpression$1"]},
    {"name": "__$ebnf$1$subexpression$2", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "__$ebnf$1$subexpression$2", "symbols": [(lexer.has("comment") ? {type: "comment"} : comment)]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "__$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": () => null},
    {"name": "uri", "symbols": [(lexer.has("uri") ? {type: "uri"} : uri)], "postprocess": ([{ value }]) => value.slice(1, -1)},
    {"name": "uri", "symbols": [(lexer.has("ref") ? {type: "ref"} : ref)], "postprocess":  ([{ value }]) => {
          const index = value.indexOf(":");
          return [value.slice(0, index), value.slice(index + 1)];
        } },
    {"name": "prefix", "symbols": [(lexer.has("kw_prefix") ? {type: "kw_prefix"} : kw_prefix), "__", (lexer.has("name") ? {type: "name"} : name), "__", (lexer.has("equal") ? {type: "equal"} : equal), "__", "uri"], "postprocess": (r) => ({ type: "prefix", key: r[2].value, value: r[6] })},
    {"name": "variable", "symbols": [(lexer.has("kw_expr") ? {type: "kw_expr"} : kw_expr), "__", (lexer.has("name") ? {type: "name"} : name), "__", (lexer.has("equal") ? {type: "equal"} : equal), "__", "expression"], "postprocess": (r) => ({ type: "variable", key: r[2].value, value: r[6] })},
    {"name": "slot", "symbols": ["uri", "__", (lexer.has("rarrow") ? {type: "rarrow"} : rarrow), "__", "expression"], "postprocess": (r) => ({ type: "slot", key: r[0], value: r[4] })},
    {"name": "case", "symbols": ["uri", "__", (lexer.has("larrow") ? {type: "larrow"} : larrow), "__", "expression"], "postprocess": (r) => ({ type: "case", key: r[0],  value: r[4]})},
    {"name": "trailing$ebnf$1$subexpression$1", "symbols": [(lexer.has("delim") ? {type: "delim"} : delim), "_"]},
    {"name": "trailing$ebnf$1", "symbols": ["trailing$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "trailing$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "trailing", "symbols": ["trailing$ebnf$1"], "postprocess": () => null},
    {"name": "expression", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "expression", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": (e) => e[2]},
    {"name": "expression", "symbols": ["exprs"], "postprocess": (e) => e[0]},
    {"name": "exprs$ebnf$1", "symbols": []},
    {"name": "exprs$ebnf$1$subexpression$1", "symbols": ["__", "expr"], "postprocess": (e) => e[1]},
    {"name": "exprs$ebnf$1", "symbols": ["exprs$ebnf$1", "exprs$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "exprs", "symbols": ["expr", "exprs$ebnf$1"], "postprocess": (e) => [e[0], ...e[1]]},
    {"name": "expr", "symbols": [(lexer.has("name") ? {type: "name"} : name)], "postprocess": ([{ value }]) => ({ type: "variable", value })},
    {"name": "expr", "symbols": [(lexer.has("identity") ? {type: "identity"} : identity)], "postprocess": () => ({ type: "identity" })},
    {"name": "expr", "symbols": [(lexer.has("unit") ? {type: "unit"} : unit)], "postprocess": () => ({ type: "terminal" })},
    {"name": "expr", "symbols": ["uri"], "postprocess": ([value]) => ({ type: "identifier", value })},
    {"name": "expr", "symbols": [(lexer.has("string") ? {type: "string"} : string), "__", "uri"], "postprocess": ([{ value }, _, datatype]) => ({ type: "constant", value, datatype })},
    {"name": "expr", "symbols": [(lexer.has("pointer") ? {type: "pointer"} : pointer), "__", "uri"], "postprocess": ([{}, _, key]) => ({ type: "dereference", key })},
    {"name": "expr", "symbols": [(lexer.has("dot") ? {type: "dot"} : dot), "__", "uri"], "postprocess": ([{}, _, key]) => ({ type: "projection", key })},
    {"name": "expr", "symbols": [(lexer.has("bslash") ? {type: "bslash"} : bslash), "__", "expression", "__", (lexer.has("modulo") ? {type: "modulo"} : modulo), "__", "uri"], "postprocess": (r) => ({ type: "injection", key: r[6], value: r[2] })},
    {"name": "expr$ebnf$1", "symbols": []},
    {"name": "expr$ebnf$1$subexpression$1", "symbols": [(lexer.has("delim") ? {type: "delim"} : delim), "_", "slot", "_"], "postprocess": (r) => r[2]},
    {"name": "expr$ebnf$1", "symbols": ["expr$ebnf$1", "expr$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "expr", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "slot", "_", "expr$ebnf$1", "trailing", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": (r) => ({ type: "tuple", slots: [r[2], ...r[4]] })},
    {"name": "expr$ebnf$2", "symbols": []},
    {"name": "expr$ebnf$2$subexpression$1", "symbols": [(lexer.has("delim") ? {type: "delim"} : delim), "_", "case", "_"], "postprocess": (r) => r[2]},
    {"name": "expr$ebnf$2", "symbols": ["expr$ebnf$2", "expr$ebnf$2$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "expr", "symbols": [(lexer.has("lbracket") ? {type: "lbracket"} : lbracket), "_", "case", "_", "expr$ebnf$2", "trailing", (lexer.has("rbracket") ? {type: "rbracket"} : rbracket)], "postprocess": (r) => ({ type: "match", cases: [r[2], ...r[4]] })},
    {"name": "link$subexpression$1", "symbols": [(lexer.has("dot") ? {type: "dot"} : dot)], "postprocess": (r) => "component"},
    {"name": "link$subexpression$1", "symbols": [(lexer.has("slash") ? {type: "slash"} : slash)], "postprocess": (r) => "option"},
    {"name": "link", "symbols": ["link$subexpression$1", "__", "uri"], "postprocess": ([type, _, key]) => ({ type, key })},
    {"name": "path$ebnf$1", "symbols": []},
    {"name": "path$ebnf$1$subexpression$1", "symbols": ["__", "link"], "postprocess": ([_, t]) => t},
    {"name": "path$ebnf$1", "symbols": ["path$ebnf$1", "path$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "path", "symbols": ["uri", "path$ebnf$1"], "postprocess": ([source, target]) => ({ source, target })},
    {"name": "map", "symbols": [(lexer.has("kw_map") ? {type: "kw_map"} : kw_map), "__", "uri", "__", (lexer.has("ldarrow") ? {type: "ldarrow"} : ldarrow), "__", "path", "__", (lexer.has("rdarrow") ? {type: "rdarrow"} : rdarrow), "__", "expression"], "postprocess": (r) => ({ type: "map", key: r[2], value: r[10], ...r[6] })}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
