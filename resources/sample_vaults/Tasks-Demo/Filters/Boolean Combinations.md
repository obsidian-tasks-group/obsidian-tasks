---
tags:
 - examples
---

# Boolean Combinations

This file contains a few examples that were useful when testing
the feature to allow Boolean combining of filters.

Full documentation is available: see [Combining Filters](https://publish.obsidian.md/tasks/Queries/Combining+Filters).

## Sample tasks for the searches below

- [ ] #task task 1 #XX
- [ ] #task task 2 #YY
- [ ] #task task 3 #ZZ
- [ ] #task task 4 #XX #YY
- [ ] #task task 5 #XX #ZZ
- [ ] #task task 6 #YY #ZZ
- [ ] #task task 7 #XX #YY #ZZ

## Examples with AND

### AND - XX and YY

```tasks
ignore global query
explain
hide backlinks

(tags includes #XX) AND (tags includes #YY)
```

### AND - XX and YY and ZZ

```tasks
ignore global query
explain
hide backlinks

(tags includes #XX) AND (tags includes #YY) AND (tags includes #ZZ)
```

## Examples with OR

### OR - XX OR YY

```tasks
ignore global query
explain
hide backlinks

(tags includes #XX) OR (tags includes #YY)
```

## (Advanced) Examples with XOR

`XOR` is an advanced feature that can give surprising results, as the examples here show.

### XOR

```tasks
ignore global query
explain
hide backlinks

(tags includes #XX) XOR (tags includes #YY)
```

### XOR Then XOR

Note the inclusion of 'task 7'. Combining multiple `XOR` does not give the expected result.
See [this question and its answers](https://electronics.stackexchange.com/questions/93713/how-is-an-xor-with-more-than-2-inputs-supposed-to-work).

```tasks
ignore global query
explain
hide backlinks

(tags includes #XX) XOR (tags includes #YY) XOR (tags includes #ZZ)
```

### XOR Then XOR workarounds

Matching only one of 3 filters - version 1:

```tasks
ignore global query
explain
hide backlinks

( (tags includes #XX) AND (tags does not include #YY) AND (tags does not include #ZZ) ) OR ( (tags includes #YY) AND (tags does not include #XX) AND (tags does not include #ZZ) ) OR ( (tags includes #ZZ) AND (tags does not include #XX) AND (tags does not include #YY) )
```

Matching only one of 3 filters - version 2:

```tasks
ignore global query
explain
hide backlinks

(tags includes #XX) XOR (tags includes #YY) XOR (tags includes #ZZ)
NOT ( (tags includes #XX) AND (tags includes #YY) AND (tags includes #ZZ) )
```

## Error Cases

These examples demonstrate the error messages for various problem scenarios.

### Extra delimiter in user query

The Boolean line ends with a stray extra `)`.

This is just an invalid query, and the extra `)` needs to be removed.

This can be spotted in the error output by looking at the delimiters on the `simplified line` in the output:

```tasks
ignore global query
explain
hide backlinks

(tags includes #XX) AND (tags includes #YY))
```

### Missing delimiter at end of user query

Here, the final `)` is missing from the end of the Boolean line.

Tasks checks that first and last character on Boolean lines, to ensure that consistent delimiters are used.

In this particular case, the error message is not overly helpful.

```tasks
ignore global query
explain
hide backlinks

(tags includes #XX) AND (tags includes #YY
```

### Delimiter swallowed by Tasks' parsing code - example 1

#### The Problem - example 1

```tasks
ignore global query
explain
hide backlinks

(description includes (maybe)) OR (description includes (perhaps))
```

#### Workaround - example 1

```tasks
ignore global query
explain
hide backlinks

[description includes (maybe)] OR [description includes (perhaps)]
```

### Delimiter swallowed by Tasks' parsing code - example 2

#### The Problem - example 2

In this example, each of the filters ends with a `)`, which is also the closing delimiter character in this Boolean line.

Looking at the error message shows the error `SyntaxError: missing ) after argument list`.

Basically, it was really hard to come up with an algorithm that allowed brackets inside filters, and allowed nested brackets in the Boolean logic.

We have settled on an algorithm that greedily matches all delimeters just around the operators (`AND`, `OR` etc)

This situation is most common with `filter by function`, as often JavaScript functions are then called.

Read on for two different ways to fix this problem.

```tasks
ignore global query
explain
hide backlinks

(filter by function task.tags.join(',').toUpperCase().includes('#XX')) AND \
(filter by function task.tags.join(',').toUpperCase().includes('#YY')) AND \
(filter by function task.tags.join(',').toUpperCase().includes('#ZZ'))
```

#### Workaround 1: use a different delimiter

The following delimiter characters are available:

- `(....)`
- `[....]`
- `{....}`
- `"...."`

We can choose any one of those delimiters sets, so long as we use the same delimiters for all sub-expressions on the line.

Here, we adjust the expression to use `[....]` instead of `(....)`:

```tasks
ignore global query
explain
hide backlinks

[filter by function task.tags.join(',').toUpperCase().includes('#XX')] AND \
[filter by function task.tags.join(',').toUpperCase().includes('#YY')] AND \
[filter by function task.tags.join(',').toUpperCase().includes('#ZZ')]
```

#### Workaround 2: add semicolons to filter by function

Our other option for fixing the error is to add semicolons (`;`) at the end of each sub-expression, to put non-space character between the `)` in the `filter by function` expression and the `) AND`:

```tasks
ignore global query
explain
hide backlinks

(filter by function task.tags.join(',').toUpperCase().includes('#XX'); ) AND \
(filter by function task.tags.join(',').toUpperCase().includes('#YY'); ) AND \
(filter by function task.tags.join(',').toUpperCase().includes('#ZZ'); )
```

#### Workaround 3: port the Boolean logic to JavaScript

We can instead migrate the Boolean operators to JavaScript:

- `AND` -> `&&`
- `OR` -> `||`
- `NOT` -> `!`

Like this:

```tasks
ignore global query
explain
hide backlinks

filter by function \
    task.tags.join(',').toUpperCase().includes('#XX') && \
    task.tags.join(',').toUpperCase().includes('#YY') && \
    task.tags.join(',').toUpperCase().includes('#ZZ')
```
