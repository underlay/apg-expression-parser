main -> _
  (prefixes __    {% (r) => r[0] %}):?
  (definitions __ {% (r) => r[0] %}):?
  "return" __ map _
  {% (r) => ({ prefixes: r[1] || [], expressions: r[2] || [], map: r[5] }) %}

_ -> [\s]:*     {% () => null%}
__ -> [\s]:+    {% () => null%}

hex -> [A-Fa-f0-9]

string -> "\"" char:* "\"" {% d => d[1].join("") %}
char -> [^\\"\n]           {% id %}
  | "\\" escape            {% d => JSON.parse("\"" + d.join("") + "\"") %}
escape -> ["\\/bfnrt]      {% id %}
  | "u" hex hex hex hex    {% d => d.join("") %}

prefix -> "prefix" __ [a-z]:+ __ "=" __ absolute
  {% (r) => [r[2].join(""), r[6]] %}

prefixes -> prefix (__ prefix {% (r) => r[1] %}):*
  {% (r) => [r[0], ...r[1]] %}

absolute -> [a-z]:+ ":" [a-zA-Z0-9\-\/\_\.\:]:+ [\/\#]
  {% (r) => r[0].join("") + r[1] + r[2].join("") + r[3] %}
  
name -> [a-z] [a-zA-Z0-9]:* {% (r) => r[0] + r[1].join("") %}

definition -> "expr" __ name __ "=" __ expression
  {% (r) => [r[2], r[6]] %}
  
definitions -> definition (__ definition {% (r) => r[1] %}):*
  {% (r) => [r[0], ...r[1]] %}

uri -> [a-z]:* ":" [a-zA-Z0-9\-\/\_\.\:\#]:+
  {% (r) => r[0].join("") + r[1] + r[2].join("") %}

slot -> uri __ "->" __ expression
  {% (r) => ({ type: "slot", key: r[0], value: r[4] }) %}
case -> uri __ "<-" __ expression 
  {% (r) => ({ type: "case", key: r[0],  value: r[4]}) %}

trailing -> (";" _):? {% () => null %}

expression -> "(" _ expression _ ")" {% (e) => e[2] %} | exprs {% (e) => e[0] %}

exprs -> expr (__ expr {% (e) => e[1] %}):* {% (e) => [e[0], ...e[1]] %}

expr -> name    {% (r) => ({ type: "variable", value: r[0] }) %}
  | "!"         {% (r) => ({ type: "terminal" }) %}
  | "<" uri ">"        {% (r) => ({ type: "identifier", value: r[1] }) %}
  | string __ uri      {% (r) => ({ type: "constant", value: r[0], datatype: r[2] }) %}
  | "*" __ uri         {% (r) => ({ type: "dereference", key: r[2] }) %}
  | "." __ uri         {% (r) => ({ type: "projection", key: r[2] }) %}
  | "/" __ expression __ "%" __ uri
    {% (r) => ({ type: "injection", key: r[6], value: r[2] }) %}
  | "{" _ slot _ ( ";" _ slot _ {% (r) => r[2]%}):* trailing "}"
    {% (r) => ({ type: "tuple", slots: [r[2], ...r[4]] }) %}
  | "[" _ case _ ( ";" _ case _ {% (r) => r[2]%}):* trailing "]"
    {% (r) => ({ type: "match", case: [r[2], ...r[4]] }) %}


path -> [\.\\] __ uri
  {% (r) =>  ({ type: r[0] === "." ? "component" : "option", value: r[2] }) %}

link -> uri __ "<=" __ uri (__ path {% (r) => r[1] %}):* __ "=>" __ expression
  {% (r) => ({ type: "link", key: r[0], source: r[4], target: r[5], value: r[9] }) %}

map -> "map" __ "{" _ link _ ( ";" _ link _ {% (r) => r[2] %}):* trailing "}"
  {% (r) => [r[4], ...r[6]] %}