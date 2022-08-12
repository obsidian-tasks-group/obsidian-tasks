---
layout: default
title: Combining Filters
nav_order: 3
parent: Queries
---

# Combining Filters

{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

---

## Summary

> Introduced in Tasks 1.9.0.

The [individual filters]({{ site.baseurl }}{% link queries/filters.md %}) provided by Tasks can be combined together in powerful ways, by wrapping each of them in `(` and `)`,
and then joining them with boolean operators such as `AND`, `OR` and `NOT`.

For example:

````text
```tasks
not done
(due after yesterday) AND (due before in two weeks)
(tags include #inbox) OR (path includes Inbox) OR (heading includes Inbox)
```
````

Each of the 3 lines in the above tasks block represents an individual filter, and only tasks which match _all_ 3 of the filter lines
will be displayed.

## Syntax

One or more filters can be combined together in a line, via boolean operators, to create a new, powerful, flexible filter.

The following rules apply:

- Each individual filter must be surrounded by parentheses: `(` and `)`.
- Operators supported are: `AND`, `OR`, `NOT`, `AND NOT`, `OR NOT` and `XOR`.
- The operators are case-sensitive: they must be capitalised.
- The operators must be surrounded by spaces.
- Use more `(` and `)` to nest further filters together.
- There is no practical limit to the number of filters combined on each line, nor the level of nesting of parentheses.

Recommendations:

- It is possible to use double quotes `"` to surround filters, but this can sometimes give misleading results when nested in complex queries, so we recommend using only `(` and `)` to build up boolean combinations.
- When combining more than two filters, use `(` and `)` liberally to ensure you get the intended logic. See 'Execution Priority' below.

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

<div class="code-example" markdown="1">
Warning
{: .label .label-yellow}
Do not combine more than two filters together with `XOR`, intending to request only one of them to be true.
It will not give the result you expect.

`(filter a) XOR (filter b) XOR (filter c)` matches tasks that match only one
of the filters, **and also tasks that match all three of the filters**.

</div>

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
(description includes waiting) OR (description includes waits) OR (description includes wartet)
```
````

### Daily notes tasks, for days other than today

I want to see tasks from anywhere in my vault with the tag `#DailyNote` or tasks in my daily notes folder, but NOT tasks in today's daily note.

````text
```tasks
not done
(tags include #DailyNote) OR ((path includes daily/Notes/Folder/) AND (path does not include 2022-07-11))
```
````

See [Daily Agenda]({{ site.baseurl }}{% link advanced/daily-agenda.md %}) for how to use templates
to embed dates in to daily notes.

### Combined GTD Contexts

Suppose you use "Getting Things Done"-style `#context` tags to say where a task can be done, so that when you are in a particular location, you can
find all the things you could choose to do.

And suppose that several of these locations are close by each other, so when you are in one place, you can easily do things in any of the other places.

#### In One of Several Locations

You could select any of the nearby locations with:

````text
# Show all tasks I CAN do in this area:
(tags include #context/loc1) OR (tags include #context/loc2) OR (tags include #context/loc3)
````

#### In None of Several Locations

Now suppose you would like to review all the other tasks, that you cannot do in the location, for some reason.

An easy way to review all the _other_ tasks not possible in this area would be to use `NOT( )` around the original query:

````text
# Show all tasks I CANNOT do in this area - EASY WAY:
NOT ( (tags include #context/loc1) OR (tags include #context/loc2) OR (tags include #context/loc3) )
````

The nice thing about the above `NOT` use is that if a new context gets added to the group in the future, it can be added to both task blocks via a simple find-and-replace.

The above is much easier to maintain than the other option of:

- Changing all the `includes` to `does not include`
- Changing all the `OR` to `AND`

````text
# Show all tasks I CANNOT do in this area - HARDER WAY
(tags do not include #context/loc1) AND (tags do not include #context/loc2) AND (tags do not include #context/loc3)
````
