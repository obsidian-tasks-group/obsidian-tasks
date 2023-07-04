---
publish: true
---

# Custom Filters

<span class="related-pages">#feature/scripting #feature/filters</span>

> [!released]
> Custom filters were introduced in Tasks X.Y.Z.

> [!warning]
> This is an early version of user documentation for `filter by function`, mainly containing reminders of the points that will need to be written up before release.

## Summary

- Define your own custom task filters, using JavaScript expressions such as:
  - `filter by function task.description.replace('#task ', '').length < 3`
- The expression must evaluate to a `boolean`, so `true` or `false`.

==TODO==

## Custom filters introduction

==TODO==

## How it works

### Available Task Properties

The Reference section [[Task Properties]] shows all the task properties available for use in custom filters.

The available task properties are also shown in the [[Quick Reference]] table.

### Expressions

The instructions look like this:

- `filter by function <expression>`

The expression must evaluate to a `boolean`, so `true` or `false`.

==TODO==

## Example custom filters

==TODO==

### Text property examples

==TODO==

Searching descriptions:

```python
# Find tasks with very short descriptions
filter by function task.description.length < 3

# Find tasks with very short descriptions, ignoring the global filter
filter by function task.description.replace('#task ', '').length < 3
```

Searching tags:

```python
# Find tasks with exactly one tag (other than any global filter)
# Need to explain use of '==='
filter by function task.tags.length === 1

# Find tasks with more than one tag (other than any global filter)
filter by function task.tags.length > 1
```

### Date property examples

==TODO==

```python
# moment() gets the current time, to the millisecond,
# at the moment with the query was parsed.
# It won't be obvious to users when that was. It depends
# on which mode, and when the query was edited.
#
# CAUTION This checks 'isSameOrAfter' to the millisecond level,
#         which is not ever going to be a realistic thing to search for,
#         which Tasks only supports dates and not times.
#         So it does not find the task due today (which has a time of `00:00`)
filter by function task.due.moment?.isSameOrAfter(moment()) || false

# This finds Tasks whose due date is today's date or later
filter by function task.due.moment?.isSameOrAfter(moment(), 'day') || false

# This finds Tasks whose due MONTH is today's MONTH or later
filter by function task.due.moment?.isSameOrAfter(moment(), 'month') || false

# Can I document use of chrono in these searches???
```

### Number property examples

==TODO==

### File property examples

==TODO==

## Tips

==TODO==

## Troubleshooting

==TODO==

### Syntax error

==TODO==
