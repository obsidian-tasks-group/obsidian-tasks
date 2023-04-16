---
tags:
 - examples
---

# Regular Expression Searches

This file contains a few examples that were useful when testing
the feature to search for text using regular expressions.

Full documentation is available: see [Regular Expressions](https://publish.obsidian.md/tasks/Queries/Regular+Expressions).

## Sample Tasks

- [ ] #task Do thing 1 #context/pc_abigail
- [ ] #task Do thing 2 #context/pc_edwina
- [ ] #task Do thing 2 #context/pc_fred
- [ ] #task Do thing 3 #context/at_work
- [ ] #task Remember to Do thing 4
- [ ] #task Upper CASE task
- [ ] #task Lower case task

## Simple searches

### Case sensitivity: add `i` after closing `/` to make case-insensitive

Finds 2 tasks:

````text
```tasks
description includes case
```
````

```tasks
description includes case
```

Only finds the task with lower-case `case`:

````text
```tasks
description regex matches /case/
```
````

```tasks
description regex matches /case/
```

Adding trailing `i` to the pattern makes the search case-insensitive:

````text
```tasks
description regex matches /case/i
```
````

```tasks
description regex matches /case/i
```

### Use pipe (|) to separate one of a number of alternatives

Old-style boolean combination:

````text
```tasks
(description includes pc_abigail) OR (description includes pc_edwina) OR (description includes at_work)
```
````

```tasks
(description includes pc_abigail) OR (description includes pc_edwina) OR (description includes at_work)
```

Regular expression equivalent. `|` allows you to search for alternative words:

````text
```tasks
description regex matches /pc_abigail|pc_edwina|at_work/
```
````

```tasks
description regex matches /pc_abigail|pc_edwina|at_work/
```

### Be careful of special characters

This search looks like it searches for `#context/pc_abigail`, but it actually searches for `#context`, because the `/` before `/pc` is interpreted as the end of the pattern being searched for.

````text
```tasks
description regex matches /#context/pc_abigail/
```
````

```tasks
description regex matches /#context/pc_abigail/
```

Instead, `/` characters in the middle of the expression must be 'escaped' with a `\`:

````text
```tasks
description regex matches /#context\/pc_abigail/
```
````

```tasks
description regex matches /#context\/pc_abigail/
```

### Tasks that to not match a regular expression

````text
```tasks
description regex does not match /pc_abigail|pc_edwina|at_work/
limit 5
```
````

```tasks
description regex does not match /pc_abigail|pc_edwina|at_work/
limit 5
```

## Special characters

### At least one digit in the description

````text
```tasks
# Any digit
description regex matches /\d/
limit 5
short mode
```
````

```tasks
# Any digit
description regex matches /\d/
limit 5
short mode
```

### No digits in the description

````text
```tasks
# At least one non-digit
description regex matches /^\D+$/
limit 10
short mode
```
````

```tasks
# At least one non-digit
description regex matches /^\D+$/
limit 10
short mode
```

## Invalid regex searches

### Extra slashes truncate the query

````text
```tasks
path regex matches /Filters/Regular Expression Searches/
```
````

```tasks
path regex matches /Filters/Regular Expression Searches/
```

Should give an error. Intention was to only match tasks in this file - but it matches all in this file.

This is how to do the above search correctly, adding a `\` before each `/` inside the pattern:

````text
```tasks
path regex matches /Filters\/Regular Expression Searches/
```
````

```tasks
path regex matches /Filters\/Regular Expression Searches/
```

### Missing `/`

````text
```tasks
description regex matches CASE
```
````

```tasks
description regex matches CASE
```

Gives:
`Tasks query: cannot parse regex (description); check your leading and trailing slashes for your query`

### Invalid flag

````text
```tasks
description regex matches /CASE/&
```
````

```tasks
description regex matches /CASE/&
```

Works. Should complain about invalid flag.

### Mismatched square brackets

````text
```tasks
description regex matches /[123/
```
````

```tasks
description regex matches /[123/
```

Gives:
`Tasks query: cannot parse regex (description); check your leading and trailing slashes for your query`

- [ ] Would like it to give a meaningful error message about what the regex error is.

## Possible developer actions

Intentionally without `#task` as not intended to be picked up by example searches above.

- [ ] Work out how to prevent `path regex matches /a/b/c/d/` from confusingly only searching `path regex matches /a/`.
  - Logged in [#1037](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1037)
- [x] Add regex support to `tag`/`tags` filter.
  - Logged in [#1040](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/1040)
- [ ] Specific error message if there are no `/` at beginning and end of query - I'm finding it really easy to forget to include these.
  - Logged in [#1038](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1038)
- [ ] Include the problem line in the error message.
  - Logged in [#1039](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1039)
