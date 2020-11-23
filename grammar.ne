@{%
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
%}

# Pass your lexer object using the @lexer option:
@lexer lexer

main -> _ (statements _ {% ([s]) => s %}):?
  {% ([_, s]) => s || [] %}

statements -> statement (__ statement {%  ([_, s]) => s %}):*
  {% ([first, rest]) => [first, ...rest] %}

statement -> (prefix | variable | map) {% ([[s]]) => s %}

_ ->  (%ws | %comment):*  {% () => null%}
__ -> (%ws | %comment):+  {% () => null%}

uri -> 
    %uri {% ([{ value }]) => value.slice(1, -1) %}
  | %ref {% ([{ value }]) => {
      const index = value.indexOf(":");
      return [value.slice(0, index), value.slice(index + 1)];
    } %}

prefix -> %kw_prefix __ %name __ %equal __ uri
  {% (r) => ({ type: "prefix", key: r[2].value, value: r[6] }) %}

variable -> %kw_expr __ %name __ %equal __ expression
  {% (r) => ({ type: "variable", key: r[2].value, value: r[6] }) %}

slot -> uri __ %rarrow __ expression
  {% (r) => ({ type: "slot", key: r[0], value: r[4] }) %}

case -> uri __ %larrow __ expression 
  {% (r) => ({ type: "case", key: r[0],  value: r[4]}) %}

trailing -> (%delim _):? {% () => null %}

expression -> %lparen _ expression _ %rparen
  {% (e) => e[2] %} | exprs {% (e) => e[0] %}

exprs -> expr (__ expr {% (e) => e[1] %}):*
  {% (e) => [e[0], ...e[1]] %}

expr ->
    %name             {% ([{ value }]) => ({ type: "variable", value }) %}
  | %unit             {% () => ({ type: "terminal" }) %}
  | uri               {% ([value]) => ({ type: "identifier", value }) %}
  | %string  __ uri   {% ([{ value }, _, datatype]) => ({ type: "constant", value, datatype }) %}
  | %pointer __ uri   {% ([{}, _, key]) => ({ type: "dereference", key }) %}
  | %dot     __ uri   {% ([{}, _, key]) => ({ type: "projection", key }) %}
  | %slash __ expression __ %modulo __ uri
    {% (r) => ({ type: "injection", key: r[6], value: r[2] }) %}
  | %lbrace   _ slot _ ( %delim _ slot _ {% (r) => r[2]%}):* trailing %rbrace
    {% (r) => ({ type: "tuple", slots: [r[2], ...r[4]] }) %}
  | %lbracket _ case _ ( %delim _ case _ {% (r) => r[2]%}):* trailing %rbracket
    {% (r) => ({ type: "match", cases: [r[2], ...r[4]] }) %}

link -> (%dot {% (r) => "component" %} | %bslash {% (r) => "option" %}) __ uri
  {% ([type, _, key]) => ({ type, key }) %}

path -> uri (__ link {% ([_, t]) => t %}):* {% ([source, target]) => ({ source, target }) %}

map -> %kw_map __ uri __ %ldarrow __ path __ %rdarrow __ expression
  {% (r) => ({ type: "map", key: r[2], value: r[10], ...r[6] }) %}
