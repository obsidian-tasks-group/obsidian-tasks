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
<a id='snippet-DocsSamplesForExplain.test.explain_expands dates.approved.query.text'></a>

```text
starts after 2 years ago
scheduled after 1 week ago
due before tomorrow
explain
```

<sup><a href='https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/Query/Explain/DocsSamplesForExplain.test.explain_expands dates.approved.query.text#L1-L5' title='Snippet source file'>snippet source</a> | <a href='#snippet-DocsSamplesForExplain.test.explain_expands dates.approved.query.text' title='Start of snippet'>anchor</a></sup>
<!-- endSnippet -->

the results begin with the following, on `2022-10-21`:

<!-- snippet: DocsSamplesForExplain.test.explain_expands dates.approved.explanation.text -->
<a id='snippet-DocsSamplesForExplain.test.explain_expands dates.approved.explanation.text'></a>

```text
All of:
  starts after 2 years ago =>
    start date is after 2020-10-21 (Wednesday 21st October 2020) OR no start date

  scheduled after 1 week ago =>
    scheduled date is after 2022-10-14 (Friday 14th October 2022)

  due before tomorrow =>
    due date is before 2022-10-22 (Saturday 22nd October 2022)
```

<sup><a href='https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/Query/Explain/DocsSamplesForExplain.test.explain_expands dates.approved.explanation.text#L1-L9' title='Snippet source file'>snippet source</a> | <a href='#snippet-DocsSamplesForExplain.test.explain_expands dates.approved.explanation.text' title='Start of snippet'>anchor</a></sup>
<!-- endSnippet -->

### Boolean combinations are displayed

For example, when the following text is placed in a tasks query block and viewed in Reading or Live Preview modes:

<!-- snippet: DocsSamplesForExplain.test.explain_boolean combinations.approved.query.text -->
<a id='snippet-DocsSamplesForExplain.test.explain_boolean combinations.approved.query.text'></a>

```text
explain
not done
(due before tomorrow) AND (is recurring)
```

<sup><a href='https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/Query/Explain/DocsSamplesForExplain.test.explain_boolean combinations.approved.query.text#L1-L4' title='Snippet source file'>snippet source</a> | <a href='#snippet-DocsSamplesForExplain.test.explain_boolean combinations.approved.query.text' title='Start of snippet'>anchor</a></sup>
<!-- endSnippet -->

the results begin with the following, on `2022-10-21`:

<!-- snippet: DocsSamplesForExplain.test.explain_boolean combinations.approved.explanation.text -->
<a id='snippet-DocsSamplesForExplain.test.explain_boolean combinations.approved.explanation.text'></a>

```text
All of:
  not done

  (due before tomorrow) AND (is recurring) =>
    All of:
      due date is before 2022-10-22 (Saturday 22nd October 2022)
      is recurring
```

<sup><a href='https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/Query/Explain/DocsSamplesForExplain.test.explain_boolean combinations.approved.explanation.text#L1-L7' title='Snippet source file'>snippet source</a> | <a href='#snippet-DocsSamplesForExplain.test.explain_boolean combinations.approved.explanation.text' title='Start of snippet'>anchor</a></sup>
<!-- endSnippet -->
