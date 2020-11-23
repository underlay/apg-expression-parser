# apg-expression-parser

> Nearley parser for the APG Expression DSL

The DSL has three kinds of top-level statements:

- _prefix declarations_, which start with the `prefix` keyword
- _expression declarations_, which start with the `expr` keyword
- _map relations_, which start with the `map` keyword

Comments start with `#` and continue until the end of the line.

### URIs

Expressions written in the DSL typically need to use lots of URIs. There are two ways of writing a URI: you can write out the full, absolute URI by wrapping it in chevrons, like `<http://example.com/a/b#c>`, or you can use prefix definitions and a prefix-compacted form. The following three examples are all equivalent:

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

### Expressions

The easiest way to think about expressions is to think of them as morphisms in a category of types.

The second easiest way to think about expressions is to think of them as a "value-grammar" (ie a way of writing out any primitive or complex value) that is augmented with a "lambda-grammar" for doing component projection, case analysis, and pointer de-referencing on a single free variable.

The third easiest way to think about expressions is to think of them as pure functions that take one value a certain type and return another value of a different type. The kinds of functions that can be written as expressions are just the ones that involve structural refactoring (and introducing constants).

The input and output types of expressions are never explicitly written out.

There are _nine_ kinds of expressions. Three out of those nine are recursive, meaning that they contain a list (or several lists) of expressions themselves.

At the syntax level, expressions are composable in the sense that they always come in a series (ie pipeline), and any expression can be "piped" into any other expression. Although this is valid syntax, is not always semantically valid.

The expression syntax has been carefully designed to be unambiguous with respect to grouping: parentheses are allowed for readability, but never affect the semantics since all expressions are associative.

The nine kinds of expressions are:

1. Declaration reference. You can reference an expression that has been previously declared with `expr foo = ...` by its name `foo`.
2. Unit / null / terminal. The symbol for the unit value (ie a fresh distinguished null) is `!`.
3. URIs. You can introduce a constant URI identifier using either an expanded form `<http://example.com/a/b#c>` or a prefix-compaced form `ex:a/b/#c`.
4. Literals. You can introduce a constant literal value using a double-quoted string followed by a URI datatype: `"Joel says \"hi!\"" xsd:string`. JSON string escaping rules apply.
5. Pointer dereference. If the free variable is of a pointer type to a label with key `ex:foo`, you can de-reference it with `* ex:foo`. The next expression in the pipeline will have the value of the label as its free variable.
6. Component projection. If the free variable is a product type that has a component named `ex:bar`, you can "get" the value of that component with `. ex:bar`.
7. Option injection. You can _produce_ a variant (ie a value of a coproduct/sum/union type) of tag `ex:baz` with `\ ... % ex:baz`, where `...` is another pipeline of expressions.
8. Tuple construction. You can create a product of three components with `{ ex:foo -> ... ; ex:bar -> ... ; ex:baz -> ... }`, where each `...` is another pipeline of expressions.
9. Case analysis. You can "handle" each option of a coproduct type with `[ ex:foo <- ... ; ex:bar <- ... ; ex:baz <- ... ]`, where each `...` is another pipeline of expressions. Note that case analysis uses square brackets instead of braces, and reverses the direction of the associating arrows.

Suppose we wanted to transform a product value that has a string `ex:name` component into a product value that has a) an optional string component `ex:name` and b) and optional number component `ex:age`. By "optional" here we just mean "a coproduct unit and something else".

We know what we want to do: inject the name into the "not null" branch of the name coproduct, and inject null into the "null" branch of the age coproduct. Let's say that the "null" branch of is tagged `ul:none` and that the "not null" branch is tagged `ul:some`. We would write this expression as:

```
expr foo = { ex:name -> \ . ex:name % ul:some ; ex:age -> \ ! % ul:none }
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
  ex:name -> \ . ex:name % ul:some ;

  # Similar story over here, except that the "inner" expression is just a unit expression (`!`),
  # which is effectively a "null constant"
  ex:age -> \ ! % ul:none ;
}
```
