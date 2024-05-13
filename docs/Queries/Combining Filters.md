---
publish: true
---

# Combining Filters

## Summary

> [!released]
>
> - Introduced in Tasks 1.9.0.
> - Major improvements in Tasks 7.0.0: for details, see [[#Appendix Changes to Boolean filters in Tasks 7.0.0]].

The [[Filters|individual filters]] provided by Tasks can be combined together in powerful ways, by:

1. wrapping each of them in delimiters such as `(` and `)`,
2. then joining them with boolean operators such as `AND`, `OR` and `NOT`.

For example:

````text
```tasks
not done
(due after yesterday) AND (due before in two weeks)
[tags include #inbox] OR [path includes Inbox] OR [heading includes Inbox]
```
````

Each of the 3 lines in the above tasks block represents an individual filter, and only tasks which match _all_ 3 of the filter lines
will be displayed.

## Syntax

One or more filters can be combined together in a line, via boolean operators, to create a new, powerful, flexible filter.

Here's a diagram of the components of a simple Boolean instruction:

```text
+--------------------------+       +--------------------------+
|   ( tag includes #XX )   |  OR   |   ( tag includes #YY )   |
+--------------------------+       +--------------------------+
    ^                  ^               ^                  ^
    |                  |               |                  |
    +- delimiters: () -+               +- delimiters: () -+
      for left sub-expression             for right sub-expression
              |                                  |
              +--------- Operator: OR -----------+
                   Connects both sub-expressions
```

The following rules apply:

- Each individual filter must be surrounded by a pair of **delimiter characters**:
  - The most commonly used delimiters in this guide are `(` and `)`.
  - The complete list of available delimiters is:
    - `(....)`
    - `[....]`
    - `{....}`
    - `"...."`
  - The types of delimiter cannot be mixed within a Boolean instruction: you must pick an appropriate delimiter for the filters on the line.
- **Operators** supported are: `AND`, `OR`, `NOT`, `AND NOT`, `OR NOT` and `XOR`.
  - The operators are case-sensitive: they must be capitalised.
  - See [[#Boolean Operators]] below.
- You can use more delimiters to nest further filters together.
- A **trailing backslash** (`\`) may be used to break a long filter over several lines, as described in [[Line Continuations]].
- There is no practical limit to the number of filters combined on each line, nor the level of nesting of parentheses.

Recommendations:

- When combining more than two filters, use `(` and `)` (or any other delimiter pair) liberally to ensure you get the intended logic. See [[#Execution Priority]] below.
- See [[#Troubleshooting Boolean Filters]] for help selecting delimiters, especially if using `filter by function`.

Technically speaking, lines continue to have an implicit `AND` relation (thus the full retention of backwards compatibility), but a line can now have multiple filters composed with `AND`, `OR`, `NOT`, `AND NOT`, `OR NOT` and `XOR` with parentheses.

### Execution Priority

Operators are evaluated in this order:

1. `NOT`
2. `XOR`
3. `AND`
4. `OR`

So these two filters are exactly equivalent - note the extra brackets in the second one:

````text
(tag includes #XX) OR (tag includes #YY) AND (tag includes #ZZ)
````

````text
(tag includes #XX) OR ( (tag includes #YY) AND (tag includes #ZZ) )
````

And these two are also exactly equivalent:

````text
(tag includes #XX) AND (tag includes #YY) OR (tag includes #ZZ)
````

````text
( (tag includes #XX) AND (tag includes #YY) ) OR (tag includes #ZZ)
````

When building a complex combination of filters, it is safest to use `(` and `)` liberally, so you can be confident you get your intended behaviour.

## Boolean Operators

The following boolean operators are supported.

### AND

> Require **every** filter to match

When you combine filters together with `AND`, only tasks that match _every_ filter will be shown.

For example, this will show tasks containing the word `some` that have a start date:

````text
(has start date) AND (description includes some)
````

Tasks requires every filter line to be matched, so the above example is equivalent to this:

````text
has start date
description includes some
````

`AND` becomes particularly valuable when used in conjunction with `OR` and `NOT`.

**Beware**: In conversation, a request such as:

> show me tasks in files with `inbox` in the path _and_ tasks with tag `#inbox`

... generally means show tasks where _either_ condition is met, and so must be represented in boolean logic with `OR`.

### OR

> Require **any** filter to match

When you combine filters together with `OR`, tasks which match _at least one_ of the filters will be shown.

For example, to show tasks in files with `inbox` in their path and also those where the tag `#inbox` is on the task line:

````text
```tasks
not done
(path includes inbox) OR (description includes #inbox)
```
````

### NOT

> Require the filter **not** to be matched

For a trivial example, these two are equivalent:

````text
path does not include inbox
````

````text
NOT (path includes inbox)
````

---

`NOT` is more useful for negating more complex expressions.

For a more realistic example, the opposite of this:

````text
(path includes x) OR (description includes #x)
````

... can be expressed without any checking of new logic like this:

```text
NOT ( (path includes x) OR (description includes #x) )
```

The other way of expressing it requires more care and thought:

````text
(path does not include x) AND (description does not include #x)
````

### AND NOT

> Require the first filter to match, and also the second one to not match

For example:

````text
(has start date) AND NOT (description includes some)
````

### OR NOT

> Require either the first filter to match, or the second one to not match.

For example:

````text
(has start date) OR NOT (description includes special)
````

### XOR

> Require **only one** of two filters to match

`XOR`, or `exclusive or` shows tasks which match _only one_ of the conditions provided.

For example, to show tasks:

- either in files with `inbox` in their path
- or where the tag `#inbox` is on the task line
- but not both:

````text
```tasks
not done
(path includes inbox) XOR (description includes #inbox)
```
````

It will not show tasks with both `inbox` in the path and the tag `#inbox` in the task line.

> [!warning]
> Do not combine more than two filters together with `XOR`, intending to request only one of them to be true.
It will not give the result you expect.

`(filter a) XOR (filter b) XOR (filter c)` matches tasks that match only one
of the filters, **and also tasks that match all three of the filters**.

## Delimiters

The following delimiter characters are available:

- `(....)`
- `[....]`
- `{....}`
- `"...."`

> [!Important]
> Each Boolean instruction line must use only one delimiter type.

This is valid:

```text
(not done) AND (is recurring)
```

This is not valid:

```text
(not done) AND {is recurring}
```

## Troubleshooting Boolean Filters

This section shows the typical solutions to a few error messages that may occur when using Boolean Filters.

### Error: malformed boolean query -- Invalid token

#### Cause: Text filter sub-expression ends with closing delimiter

The full error message is:

`malformed boolean query -- Invalid token (check the documentation for guidelines)`

> [!error] Broken query
> `(description includes (maybe)) OR (description includes (perhaps))`

How to fix the query:

> [!Info] Use a different delimiter
> `[description includes (maybe)] OR [description includes (perhaps)]`

This is why Tasks offers a choice of [[#Delimiters|delimiters]] around sub-expressions.

#### Spotting malformed boolean query problems - with built-in filters

Here is the bulk of the error text for the above broken query:

```text
Tasks query: Could not interpret the following instruction as a Boolean combination:
    (description includes (maybe)) OR (description includes (perhaps))

The error message is:
    malformed boolean query -- Invalid token (check the documentation for guidelines)

The instruction was converted to the following simplified line:
    (f1)) OR (f2))

Where the sub-expressions in the simplified line are:
    'f1': 'description includes (maybe'
        => OK
    'f2': 'description includes (perhaps'
        => OK
```

> [!tip] Points to note in the above output:
>
> 1. The mismatched brackets in the simplified line: `(f1)) OR (f2))`
> 2. The missing closing `)` in the sub-expressions:
>     - `'f1': 'description includes (maybe'`
>     - `'f2': 'description includes (perhaps'`

#### Cause: 'filter by function' sub-expression ends with closing delimiter

> [!error] Broken query
>
> ```text
> (filter by function task.tags.join(',').toUpperCase().includes('#XX')) AND \
> (filter by function task.tags.join(',').toUpperCase().includes('#YY')) AND \
> (filter by function task.tags.join(',').toUpperCase().includes('#ZZ'))
> ```

We have several options:

> [!info] Option 1: use a different delimiter
>
> ```text
> [filter by function task.tags.join(',').toUpperCase().includes('#XX')] AND \
> [filter by function task.tags.join(',').toUpperCase().includes('#YY')] AND \
> [filter by function task.tags.join(',').toUpperCase().includes('#ZZ')]
> ```

We can choose any one of the available [[#Delimiters|delimiter sets]], so long as we use the same delimiters for all sub-expressions on the line.

Above, we adjusted the query to use `[....]` instead of `(....)`, as we know that none of our sub-expressions ends with a `]`.

> [!info] Option 2: add semicolons to filter by function
>
> ```text
> (filter by function task.tags.join(',').toUpperCase().includes('#XX'); ) AND \
> (filter by function task.tags.join(',').toUpperCase().includes('#YY'); ) AND \
> (filter by function task.tags.join(',').toUpperCase().includes('#ZZ'); )
> ```

Above, we added a semicolon (`;`) at the end of each sub-expression, to put non-space character between the `)` in the `filter by function` expression and the closing Boolean delimter `)`.

> [!info] Option 3: port the Boolean logic to JavaScript
>
> ```text
> filter by function \
>     task.tags.join(',').toUpperCase().includes('#XX') && \
>     task.tags.join(',').toUpperCase().includes('#YY') && \
>     task.tags.join(',').toUpperCase().includes('#ZZ')
> ```

Above, we migrated the Boolean operators to JavaScript ones instead.

| Task Operator | JavaScript operator |
| ------------- | ------------------- |
| `AND`         | `&&`                |
| `OR`          | <code>\|\|</code>   |
| `NOT`         | `!`                 |

#### Spotting malformed boolean query problems - with 'filter by function'

Here is the bulk of the error text for the above broken query:

```text
Tasks query: Could not interpret the following instruction as a Boolean combination:
    (filter by function task.tags.join(',').toUpperCase().includes('#XX')) AND (filter by function task.tags.join(',').toUpperCase().includes('#YY')) AND (filter by function task.tags.join(',').toUpperCase().includes('#ZZ'))

The error message is:
    malformed boolean query -- Invalid token (check the documentation for guidelines)

The instruction was converted to the following simplified line:
    (f1)) AND (f2)) AND (f3))

Where the sub-expressions in the simplified line are:
    'f1': 'filter by function task.tags.join(',').toUpperCase().includes('#XX''
        => ERROR:
           Error: Failed parsing expression "task.tags.join(',').toUpperCase().includes('#XX'".
           The error message was:
           "SyntaxError: missing ) after argument list"
    'f2': 'filter by function task.tags.join(',').toUpperCase().includes('#YY''
        => ERROR:
           Error: Failed parsing expression "task.tags.join(',').toUpperCase().includes('#YY'".
           The error message was:
           "SyntaxError: missing ) after argument list"
    'f3': 'filter by function task.tags.join(',').toUpperCase().includes('#ZZ''
        => ERROR:
           Error: Failed parsing expression "task.tags.join(',').toUpperCase().includes('#ZZ'".
           The error message was:
           "SyntaxError: missing ) after argument list"
```

> [!tip] Points to note in the above output:
>
> 1. The mismatched brackets in the simplified line: `(f1)) AND (f2)) AND (f3))`
> 2. The missing closing `)` in the sub-expressions:
>     - `'f1': 'filter by function task.tags.join(',').toUpperCase().includes('#XX''`
>     - `'f2': 'filter by function task.tags.join(',').toUpperCase().includes('#YY''`
>     - `'f3': 'filter by function task.tags.join(',').toUpperCase().includes('#ZZ''`
> 3. The error messages, including:
>     - `"SyntaxError: missing ) after argument list"`

### Error: All filters in a Boolean instruction must be inside one of these pairs of delimiter characters

The full message is:

`All filters in a Boolean instruction must be inside one of these pairs of delimiter characters: (...) or [...] or {...} or "...". Combinations of those delimiters are no longer supported.`

#### Cause: Mismatched delimiter types

> [!error] Broken query
> `"not done" AND (is recurring)`

How to fix the query:

> [!Info] Fix: Make the delimiters consistent
> `(not done) AND (is recurring)`

The full output includes:

```text
Tasks query: Could not interpret the following instruction as a Boolean combination:
    "not done" AND (is recurring)

The error message is:
    All filters in a Boolean instruction must be inside one of these pairs of delimiter characters: (...) or [...] or {...} or "...". Combinations of those delimiters are no longer supported.
Problem line: ""not done" AND (is recurring)"
```

## Examples

### Managing tasks via file path and tag

I have tasks for People in our weekly meeting notes and then I might reference a tag using their name in other notes:

````text
```tasks
not done
(path includes Peter) OR (tags includes #Peter)
```
````

### Finding tasks that are waiting

I want to find tasks that are waiting for something else. But 'waiting' can be spelled in several different ways:

````text
```tasks
not done
(description includes waiting) OR \
  (description includes waits) OR \
  (description includes wartet)
```
````

### Daily notes tasks, for days other than today

I want to see tasks from anywhere in my vault with the tag `#DailyNote` or tasks in my daily notes folder, but NOT tasks in today's daily note.

````text
```tasks
not done
(tags include #DailyNote) OR \
( (path includes daily/Notes/Folder/) AND \
  (path does not include 2022-07-11) \
)
```
````

See [[Daily Agenda]] for how to use templates
to embed dates in to daily notes.

### Combined GTD Contexts

Suppose you use "Getting Things Done"-style `#context` tags to say where a task can be done, so that when you are in a particular location, you can
find all the things you could choose to do.

And suppose that several of these locations are close by each other, so when you are in one place, you can easily do things in any of the other places.

#### In One of Several Locations

You could select any of the nearby locations with:

````text
# Show all tasks I CAN do in this area:
(tags include #context/loc1) OR \
  (tags include #context/loc2) OR \
  (tags include #context/loc3)
````

#### In None of Several Locations

Now suppose you would like to review all the other tasks, that you cannot do in the location, for some reason.

An easy way to review all the _other_ tasks not possible in this area would be to use `NOT( )` around the original query:

````text
# Show all tasks I CANNOT do in this area - EASY WAY:
NOT ( \
  (tags include #context/loc1) OR \
  (tags include #context/loc2) OR \
  (tags include #context/loc3) \
)
````

The nice thing about the above `NOT` use is that if a new context gets added to the group in the future, it can be added to both task blocks via a simple find-and-replace.

The above is much easier to maintain than the other option of:

- Changing all the `includes` to `does not include`
- Changing all the `OR` to `AND`

````text
# Show all tasks I CANNOT do in this area - HARDER WAY
(tags do not include #context/loc1) AND \
  (tags do not include #context/loc2) AND \
  (tags do not include #context/loc3)
````

## Appendix: Changes to Boolean filters in Tasks 7.0.0

Tasks 7.0.0 involved a tremendous amount of work behind the scenes to improve the behaviour and usability of Boolean filters.

This section describes the changes, for completeness.

### Mixing of delimiter types is no longer allowed

> [!Danger] Breaking change
> This (undocumented) mixing of delimiter types used to be a valid query, prior to Tasks 7.0.0:
>
> ```text
> (not done) AND "is recurring"
> ```

It is no longer valid, as mixing of [[#Delimiters|delimiter types]] in a Boolean instruction is no longer allowed.

It may be fixed by changing it to use consistent delimiters, for example with one of these:

```text
(not done) AND (is recurring)
"not done" AND "is recurring"
```

### Sub-expressions can now contain parentheses and double-quotes

Sub-expressions can now contain parentheses - `(` and `)` and double-quotes - `"`.

See [[#Troubleshooting Boolean Filters]] for how to deal with sub-expressions that end with the closing delimiter character.

### More options for delimiting sub-expressions

The following delimiter characters are available:

- `(....)`
- `[....]`
- `{....}`
- `"...."`

See [[#Delimiters]] above.

### Spaces around Operators are now optional

Spaces around Operators are now optional.

For example, before Tasks 7.0.0 the following was invalid, as there were no spaces `AND`.

`(path includes a)AND(path includes b)`

Tasks now adds the missing spaces behind the scenes, so the above is now equivalent to:

`(path includes a) AND (path includes b)`

### Much better assistance with errors

A lot of effort went in to giving useful information if a Boolean instruction is invalid.

Before:

```text
Tasks query: malformed boolean query -- Invalid token (check the documentation for guidelines)
Problem line: "(description includes (maybe)) OR (description includes (perhaps))"
```

After:

```text
Tasks query: Could not interpret the following instruction as a Boolean combination:
    (description includes (maybe)) OR (description includes (perhaps))

The error message is:
    malformed boolean query -- Invalid token (check the documentation for guidelines)

The instruction was converted to the following simplified line:
    (f1)) OR (f2))

Where the sub-expressions in the simplified line are:
    'f1': 'description includes (maybe'
        => OK
    'f2': 'description includes (perhaps'
        => OK

For help, see:
    https://publish.obsidian.md/tasks/Queries/Combining+Filters

Problem line: "(description includes (maybe)) OR (description includes (perhaps))"
```
