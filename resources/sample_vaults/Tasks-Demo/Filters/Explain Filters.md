---
tags:
 - examples
---

# Explain Filters

The `explain` instruction tells a Tasks block to display details of its filters.

## Date-dependent values are expanded

```tasks
scheduled after 2 years ago
due before tomorrow
explain
limit 1
```

## Boolean combinations are displayed

```tasks
explain
not done
(due before tomorrow) AND (is recurring)
limit 1
```

## Nested Boolean logic

```tasks
explain
(description includes 1) AND (description includes 2) AND (description includes 3) AND (description includes 4)
limit 1
```

## Nested Boolean logic with NOT

```tasks
explain
NOT ( (description includes 1) AND (description includes 2) AND (description includes 3) AND (description includes 4) )
limit 1
```

## One filter

```tasks
explain
starts before today
limit 1
```

## No filters

```tasks
explain
limit 1
```
