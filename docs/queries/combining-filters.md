---
layout: default
title: Combining Filters
nav_order: 2
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

## Introduction

> Introduced in Tasks 1.9.0.

Tasks now has full, generic and flexible support for combining filters together, via boolean expressions, as part of the plugin's query engine.

It is fully backwards-compatible, so earlier searches still work. This new feature adds the full flexibility of `OR` queries and the full power of boolean composition.

## Syntax

The syntax looks like this:

````text
```tasks
not done
(due after yesterday) AND (due before in two weeks)
(tags include #inbox) OR (path includes Inbox) OR (heading includes Inbox)
```
````

Lines continue to have an implicit `AND` relation (thus the full retention of backwards compatibility), but a line can now have multiple filters composed with `AND`, `OR`, `NOT`, `AND NOT`, `OR NOT` and `XOR` with parentheses.

---

Warning
{: .label .label-yellow }
It is possible to use double quotes `"` to surround filters, but this can sometimes give misleading results when nested in complex queries, so we recommend use `(` and `)` to build up boolean combinations.

---

## Boolean Operators

### AND

When you combine filters together with `AND`, only tasks that match every filter will be shown.

For example:

````text
(has start date) AND (description includes some)
````

Tasks requires every filter line to be matched, so the above example is equivalent to:

````text
has start date
description includes some
````

`AND` becomes particularly valuable when used in conjunction with `OR` and `NOT`.

### OR

When you combine filters together with `OR`, tasks which match _at least one_ of the filters will be shown.

For example, to show both tasks in files with `inbox` in their path and where the tag `#inbox` is on the task line:

````text
```tasks
not done
(path includes inbox) OR (description includes #inbox)
```
````

Beware: In conversation, a request to show me things in the `inbox` file or folder and things with tag `#inbox` must be represented in boolean logic with `OR`, as we accept tasks where _either_ condition is met.

### NOT

Opposite of:

````text
( (path includes x) OR (description includes #x) )
````

Is:

````text
( (path does not include x) AND (description does not include #x) )
````

Simpler is:

```text
NOT ( (path includes x) OR (description includes #x) )
```

Suppose you use `#context` tags so say where a task can be done, so that when you are in that location, you can
find all the things you could choose to do.

And suppose that several of these locations are close by each other, so when you are in one place, you can easily do things in one of the other places.

````text
# Show all tasks I CAN do in this area:
(tags include #context/loc1) OR (tags include #context/loc2) OR (tags include #context/loc3)
````

An easy way to see all the other tasks not possible in this area would be to use `NOT( )` around the original query:

````text
# Show all tasks I CANNOT do in this area - EASY WAY:
NOT ( (tags include #context/loc1) OR (tags include #context/loc2) OR (tags include #context/loc3) )
````

The nice thing about the above `NOT` use is that if a new context gets added to the group in future, it can be added to both task blocks via a simple find-and-replace.

The above is much easier to maintain than the harder option of:

- Changing all the `includes` to `does not include`
- Changing all the `OR` to `AND`

````text
# Show all tasks I CANNOT do in this area - HARD WAY
(tags do not include #context/loc1) AND (tags do not include #context/loc2 ) AND (tags do not include #context/loc3)
````

### AND NOT

### OR NOT

### XOR

`XOR`, or `exclusive or` shows tasks which match _only one_ of the conditions provided.

For example, to show tasks:

- either in files with `inbox` in their path
- or where the tag `#inbox` is on the task line:

````text
```tasks
not done
(path includes inbox) XOR (description includes #inbox)
```
````

It will not show tasks with both `inbox` in the path and the tag `#inbox` is the task line.

## Nesting

## Priority

Operators are evaluated in this order:

1. NOT
2. XOR
3. AND
4. OR

So these two blocks are exactly equivalent - note the extra brackets in the second one:

````text
```tasks
not done
(tag includes #XX) OR (tag includes #YY) AND (tag includes #ZZ)
```
````

````text
```tasks
not done
(tag includes #XX) OR ( (tag includes #YY) AND (tag includes #ZZ) )
```
````

And these two are also exactly equivalent:

````text
```tasks
not done
(tag includes #XX) AND (tag includes #YY) OR (tag includes #ZZ)
```
````

````text
```tasks
not done
( (tag includes #XX) AND (tag includes #YY) ) OR (tag includes #ZZ)
```
````

When building a complex combination of expressions, it is safest to use `(` and `)` liberally, so you can be confident you get your intended behaviour.

## Examples
