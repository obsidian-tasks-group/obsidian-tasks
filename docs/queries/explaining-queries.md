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

For example, when the following text is placed in a tasks query block and viewed in Reading or Live Preview modes:

<!-- snippet: DocsSamplesForExplain.test.explain_expands dates.approved.query.text -->
```text
starts after 2 years ago
scheduled after 1 week ago
due before tomorrow
explain
```
<!-- endSnippet -->

the results begin with the following, on `2022-10-21`:

<!-- snippet: DocsSamplesForExplain.test.explain_expands dates.approved.explanation.text -->
```text
Explanation of this Tasks code block query:

AND (All of):
  starts after 2 years ago =>
    start date is after 2020-10-21 (Wednesday 21st October 2020) OR no start date

  scheduled after 1 week ago =>
    scheduled date is after 2022-10-14 (Friday 14th October 2022)

  due before tomorrow =>
    due date is before 2022-10-22 (Saturday 22nd October 2022)
```
<!-- endSnippet -->

### Boolean combinations are displayed

For example, when the following text is placed in a tasks query block and viewed in Reading or Live Preview modes:

<!-- snippet: DocsSamplesForExplain.test.explain_boolean combinations.approved.query.text -->
```text
explain
not done
(due before tomorrow) AND (is recurring)
```
<!-- endSnippet -->

the results begin with the following, on `2022-10-21`:

<!-- snippet: DocsSamplesForExplain.test.explain_boolean combinations.approved.explanation.text -->
```text
Explanation of this Tasks code block query:

AND (All of):
  not done

  (due before tomorrow) AND (is recurring) =>
    AND (All of):
      due date is before 2022-10-22 (Saturday 22nd October 2022)
      is recurring
```
<!-- endSnippet -->

### More complex combinations are displayed

For example, when the following text is placed in a tasks query block and viewed in Reading or Live Preview modes:

<!-- snippet: DocsSamplesForExplain.test.explain_nested boolean combinations.approved.query.text -->
```text
explain
(description includes 1) AND (description includes 2) AND (description includes 3) AND (description includes 4)
```
<!-- endSnippet -->

the results begin with the following, on `2022-10-21`:

<!-- snippet: DocsSamplesForExplain.test.explain_nested boolean combinations.approved.explanation.text -->
```text
Explanation of this Tasks code block query:

AND (All of):
  (description includes 1) AND (description includes 2) AND (description includes 3) AND (description includes 4) =>
    AND (All of):
      description includes 1
      description includes 2
      description includes 3
      description includes 4
```
<!-- endSnippet -->
