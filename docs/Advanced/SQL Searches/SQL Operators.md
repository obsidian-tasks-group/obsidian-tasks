---
publish: true
---

# Operators

<span class="related-pages">#advanced/sql-search</span>

The following operators can be used in the SQL based queries.

Number

```text
+,-,*,/
```

String

```text
+
```

Logic

```text
AND, OR, NOT
=, !=, <>, >, >=, <, <=
```

## Complex operators

SQL related

```text
WHERE v BETWEEN a AND b
WHERE v NOT BETWEEN a AND b
WHERE v IN (10,20,30)
WHERE v NOT IN (SELECT status->symbol FROM tasks WHERE)
WHERE v >= ANY (20,30,40)
```

Access a child property

The `->` operator is used to access nested data and functions.

- `property->text` equals `property["text"]` in JavaScript
- `property->number` equals `property[number]` in JavaScript
- `property->functionName(args)` equals `property["functionName"](args)` in JavaScript

Object property

- `a -> b`
- `a -> b -> c`

Array member

- `a -> 1`
- `a -> 1 -> 2`

Calculated property name

- `a -> (1+2)`
- `a -> ("text2 + " " + "more")`

Functions

- `myTime -> getFullYear()`
- `s -> substr(1,2)`

Array members

```text
WHERE tags->(0) = "work"
```

JavaScript string functions can also be used

```text
WHERE description->length > 10
```
