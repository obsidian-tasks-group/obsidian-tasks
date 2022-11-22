---
layout: default
title: Explaining Queries
nav_order: 9
parent: Queries
has_toc: false
---

# Explaining Queries

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

## Overview: the 'explain' instruction

> Introduced in Tasks 1.19.0.

The `explain` instruction adds some extra output at the start of the search results, when tasks blocks are viewed in Live Preview and Reading modes.

This has a number of benefits:

- It is easy to understand data-based-filters:
  - Any dates in filters are expanded, to show the actual dates used in the search.
- Boolean query logic is clearer.
  - Combinations of queries (via `AND`, `OR`, `NOT` etc)  can be seen more clearly.

## Examples

### Dates in filters are expanded

For example, when viewed in Reading or Live Preview modes:

````text
```tasks
scheduled after 2 years ago
due before tomorrow
explain
```
````

the results begin with the following, on `2022-10-21`:

```text
Explanation of query:

All of:
  scheduled after 2 years ago =>
    scheduled date is after 2020-10-20 (Tuesday)

  due before tomorrow =>
    due date is before 2022-10-21 (Friday)
```

### Boolean combinations are displayed

For example, when viewed in Reading or Live Preview modes:

````text
```tasks
explain
not done
(due before tomorrow) AND (is recurring)
```
````

the results begin with the following, on `2022-10-21`:

```text
Explanation of query:

All of:
  not done

  (due before tomorrow) AND (is recurring) =>
    All of:
      due date is before 2022-10-21 (Friday)
      is recurring
```
