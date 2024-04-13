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

```tasks
ignore global query
explain
hide backlinks

(tags includes #XX) AND (tags includes #YY))
```

### Missing delimiter at end of user query

```tasks
ignore global query
explain
hide backlinks

(tags includes #XX) AND (tags includes #YY
```

### Delimiter swallowed by Tasks' parsing code

#### The Problem

```tasks
ignore global query
explain
hide backlinks

limit 1
(filter by function task.tags.join(',').toUpperCase().includes('#XX')) AND \
(filter by function task.tags.join(',').toUpperCase().includes('#YY')) AND \
(filter by function task.tags.join(',').toUpperCase().includes('#ZZ'))
```

#### Workaround 1: use a different delimiter

```tasks
ignore global query
explain
hide backlinks

limit 1
[filter by function task.tags.join(',').toUpperCase().includes('#XX')] AND \
[filter by function task.tags.join(',').toUpperCase().includes('#YY')] AND \
[filter by function task.tags.join(',').toUpperCase().includes('#ZZ')]
```

#### Workaround 2: add semicolons to filter by function

```tasks
ignore global query
explain
hide backlinks

limit 1
(filter by function task.tags.join(',').toUpperCase().includes('#XX'); ) AND \
(filter by function task.tags.join(',').toUpperCase().includes('#YY'); ) AND \
(filter by function task.tags.join(',').toUpperCase().includes('#ZZ'); )
```
