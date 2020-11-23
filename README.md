# apg-expression-parser

> Nearley parser for the APG Expression DSL

## DSL

The DSL has three kinds of top-level statements:

- _prefix declarations_, which start with the `prefix` keyword
- _expression declarations_, which start with the `expr` keyword
- _map relations_, which start with the `map` keyword

Comments start with `#` and continue until the end of the line.

Whitespace is not significant. Most grammar terms need to be separated by some whitespace, but newlines and indentation can be introduced anywhere.

### URIs

Expressions written in the DSL typically need to use lots of URIs. There are two ways of writing a URI: you can write out the full, absolute URI by wrapping it in angle brackets, like `<http://example.com/a/b#c>`, or you can use prefix definitions and a prefix-compacted form. The following three examples are all equivalent:

```
expr foo = <http://example.com/a/b#c>
```

```
prefix ex = <http://example.com/>
expr foo = ex:a/b#c
```

```
prefix ex = <http://example.com/>
prefix b = ex:a/b#
expr foo = b:c
```

For now, the grammar will only parse URIs matching the pattern `/[a-z]+:[a-zA-Z0-9-/_.:#]+/`.

Since the XSD namespace is used particularly frequently, it is given special treatment. It never has to be declared, and is always available as the "empty prefix". For example, `:string` is always equivalent to `<http://www.w3.org/2001/XMLSchema#string>`.

### Expressions

The easiest way to think about expressions is to think of them as morphisms in a category of types.

The second easiest way to think about expressions is to think of them as a "value-grammar" (ie a way of writing out any primitive or complex value) that is augmented with a "lambda-grammar" for doing component projection, case analysis, and pointer de-referencing on a single free variable.

The third easiest way to think about expressions is to think of them as pure functions that take one value of a certain type and return another value of a different type. The kinds of functions that can be written as expressions are just the ones that involve structural refactoring (and introducing constants).

The input and output types of expressions are never explicitly written out.

There are ten kinds of expressions. Three of them are recursive, meaning that they contain a list (or several lists) of expressions themselves.

Expressions always come in a series (ie pipeline), and any expression can be "piped" into any other expression. Although this is valid syntax, is not always semantically valid.

The expression syntax has been carefully designed to be unambiguous with respect to grouping: parentheses are allowed for readability, but never affect the semantics since all expressions are associative. Newlines and indentation are the preferred method of organizing complex expressions; not parentheses.

The ten kinds of expressions are:

0. Identity. You can just return the input (ie the value of the free variable) with the symbol `@`.
1. Declaration reference. You can reference an expression that has been previously declared with `expr foo = ...` by its name `foo`.
2. Unit / null / terminal. The symbol for the unit value (ie a fresh distinguished null) is `!`.
3. URIs. You can introduce a constant URI identifier using either an expanded form `<http://example.com/a/b#c>` or a prefix-compaced form `ex:a/b#c`.
4. Literals. You can introduce a constant literal value using a double-quoted string followed by a URI datatype: `"Joel says \"hi!\"" :string`. JSON string escaping rules apply.
5. Pointer dereference. If the free variable is of a pointer type to a label with key `ex:foo`, you can de-reference it with `* ex:foo`. The next expression in the pipeline will have the value of the label as its free variable.
6. Component projection. If the free variable is a product type that has a component named `ex:bar`, you can "get" the value of that component with `. ex:bar`.
7. Option injection. You can _produce_ a variant (ie a value of a coproduct/sum/union type) of tag `ex:baz` with `\ ... % ex:baz`, where `...` is another pipeline of expressions.
8. Tuple construction. You can create a product of e.g. three components with `{ ex:foo -> ... ; ex:bar -> ... ; ex:baz -> ... }`, where each `...` is another pipeline of expressions. The last `;` is optional.
9. Case analysis. You can "handle" each option of a coproduct type with `[ ex:foo <- ... ; ex:bar <- ... ; ex:baz <- ... ]`, where each `...` is another pipeline of expressions. Note that case analysis uses square brackets instead of braces, and reverses the direction of the associating arrows. The branches of each case must return values of the same type, or at least "unifiable types", which will be explained later. Again, the last `;` is optional.

Suppose we wanted to transform a product value that has a string `ex1:name` component into a product value that has a) an optional string component `ex2:name` and b) and optional number component `ex2:age`. By "optional" here we just mean "the coproduct of a unit and something else".

We know what we want to do: inject the name into the "not null" branch of the name coproduct, and inject null into the "null" branch of the age coproduct. Let's say that the "null" branch of is tagged `ul:none` and that the "not null" branch is tagged `ul:some`. We would write this expression as:

```
expr foo = { ex2:name -> \ . ex1:name % ul:some ; ex2:age -> \ ! % ul:none }
```

Damn! What's going on here?

```
# We're declaring a new expression `foo`.
# Expression declarations (like everything else) actually take a _series_
# of expressions, although this declaration only has one expression in the series.
# The one expression in the series is a tuple expression, and it has two slots:
expr foo = {
  # Again, tuple slots technically take a series of expressions,
  # but again, this one only has one in the series.
  # The one expression is an injection expression,
  # which is of the form \ ... % ul:some, where `...` is another series of expressions.
  # The one expression in that inner series is a projection on the component named ex:name.
  ex2:name -> \ . ex1:name % ul:some ;

  # Similar story over here, except that the "inner" expression is just a unit expression (`!`),
  # which is effectively a "null constant"
  ex2:age -> \ ! % ul:none ;
}
```

Now let's say we wanted to go back again and transform a value of the output type into a value of our original input type:

```
expr oof = { ex1:name -> . ex2:name [ ul:some <- @ ; ul:none <- "" :string ] }
```

This time we have to do some case analysis on the name component, since it could be either a string or null. In the `ul:some` branch, the bound variable will be a string literal, so we have an identity expression. In the `ul:none` branch, the bound variable will be a unit value, but we still need to return a string so that the types mach up, so we just return a constant `"" :string`.

We also could have written the same expression this way:

```
expr oof = . ex2:name [ ul:some <- { ex1:name -> @ } ; ul:none <- { ex1: name -> "" :string } ]
```

by doing the case analysis first, outside, and then constructing the tuple indepdendently (within each branch).

### Maps

Simply delcaring expressions doesn't actually do anything - it's just a convenience feature that enable re-using them as fragments in other expressions. The real output of the DSL is a set of map relations, which are declared with a special kind of ternary statement.

A map has three parts: a URI `[key]`, a `[path]`, and a `[value]`. Its syntax looks like this: `map [key] <= [path] => [value]`.

The _key_ of a map is just a URI in either compact or expanded form.

The _path_ of a map is a term in this grammar: `uri (__ ("." | "/") __ uri):*` - ie a non-empty path of URIs delimited by `.` and `/` tokens.

The _value_ of a map is just a series of expressions.

Maps relations are typically split into three lines like this:

```
map ex:foo
  <= ex:bar1 . ex:bar2 / ex:bar3
  => { ex:hello -> ! ; ex:world -> "cool!" :string }
```
