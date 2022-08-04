# Boolean Combinations

This file contains a few examples that were useful when testing
the feature to allow Boolean combining of filters.

Full documentation is available: see [Combining Filters](https://obsidian-tasks-group.github.io/obsidian-tasks/queries/combining-filters/).

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
not done
(tags includes #XX) AND (tags includes #YY)
```

### AND - XX and YY and ZZ

```tasks
not done
(tags includes #XX) AND (tags includes #YY) AND (tags includes #ZZ)
```

## Examples with OR

### OR - XX OR YY

```tasks
not done
(tags includes #XX) OR (tags includes #YY)
```

## (Advanced) Examples with XOR

`XOR` is an advanced feature that can give surprising results, as the examples here show.

### XOR

```tasks
not done
(tags includes #XX) XOR (tags includes #YY)
```

### XOR Then XOR

Note the inclusion of 'task 7'. Combining multiple `XOR` does not give the expected result.
See [this question and its answers](https://electronics.stackexchange.com/questions/93713/how-is-an-xor-with-more-than-2-inputs-supposed-to-work).

```tasks
not done
(tags includes #XX) XOR (tags includes #YY) XOR (tags includes #ZZ)
```

### XOR Then XOR workarounds

Matching only one of 3 filters - version 1:

```tasks
not done
( (tags includes #XX) AND (tags does not include #YY) AND (tags does not include #ZZ) ) OR ( (tags includes #YY) AND (tags does not include #XX) AND (tags does not include #ZZ) ) OR ( (tags includes #ZZ) AND (tags does not include #XX) AND (tags does not include #YY) )
```

Matching only one of 3 filters - version 2:

```tasks
not done
(tags includes #XX) XOR (tags includes #YY) XOR (tags includes #ZZ)
NOT ( (tags includes #XX) AND (tags includes #YY) AND (tags includes #ZZ) )
```
