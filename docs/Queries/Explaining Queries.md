---
publish: true
---

# Explaining Queries

## Overview: the 'explain' instruction

> [!released]
Introduced in Tasks 1.19.0.

The `explain` instruction adds some extra output at the start of the search results, when tasks blocks are viewed in Live Preview and Reading modes.

This has a number of benefits:

- It is easy to understand date-based-filters:
  - Any dates in filters are expanded, to show the actual dates used in the search.
- Boolean query logic is clearer.
  - Combinations of queries (via `AND`, `OR`, `NOT` etc)  can be seen more clearly.
- If there is a [[Global Filter|global filter]] enabled, it is included in the explanation.
  - This often explains why tasks are missing from results.
- If there is a [[Global Query|global query]] enabled, it too is included in the explanation.

## Examples

### Dates in filters are expanded

For example, when the following text is placed in a tasks query block:

<!-- snippet: DocsSamplesForExplain.test.explain_expands_dates.approved.query.text -->
```text
starts after 2 years ago
scheduled after 1 week ago
due before tomorrow
explain
```
<!-- endSnippet -->

the results begin with the following, on `2022-10-21`:

<!-- snippet: DocsSamplesForExplain.test.explain_expands_dates.approved.explanation.text -->
```text
Explanation of this Tasks code block query:

starts after 2 years ago =>
  start date is after 2020-10-21 (Wednesday 21st October 2020) OR no start date

scheduled after 1 week ago =>
  scheduled date is after 2022-10-14 (Friday 14th October 2022)

due before tomorrow =>
  due date is before 2022-10-22 (Saturday 22nd October 2022)
```
<!-- endSnippet -->

Note how it shows the dates being searched for very clearly, including the day of the week.

It also shows that `starts` searches also match tasks with not start date.

### Boolean combinations are displayed

For example, when the following text is placed in a tasks query block:

<!-- snippet: DocsSamplesForExplain.test.explain_boolean_combinations.approved.query.text -->
```text
explain
not done
(due before tomorrow) AND (is recurring)
```
<!-- endSnippet -->

the results begin with the following, on `2022-10-21`:

<!-- snippet: DocsSamplesForExplain.test.explain_boolean_combinations.approved.explanation.text -->
```text
Explanation of this Tasks code block query:

not done

(due before tomorrow) AND (is recurring) =>
  AND (All of):
    due date is before 2022-10-22 (Saturday 22nd October 2022)
    is recurring
```
<!-- endSnippet -->

### More complex combinations are displayed

With complex Boolean combinations of filters, it is easy to get parentheses in the wrong place. With `explain`, the interpreted logic is easily visible.

For example, when the following text is placed in a tasks query block:

<!-- snippet: DocsSamplesForExplain.test.explain_nested_boolean_combinations.approved.query.text -->
```text
explain
( (description includes 1) AND (description includes 2) AND (description includes 3) ) OR ( (description includes 5) AND (description includes 6) AND (description includes 7) ) AND NOT (description includes 7)
```
<!-- endSnippet -->

the results begin with the following, on `2022-10-21`:

<!-- snippet: DocsSamplesForExplain.test.explain_nested_boolean_combinations.approved.explanation.text -->
```text
Explanation of this Tasks code block query:

( (description includes 1) AND (description includes 2) AND (description includes 3) ) OR ( (description includes 5) AND (description includes 6) AND (description includes 7) ) AND NOT (description includes 7) =>
  OR (At least one of):
    AND (All of):
      description includes 1
      description includes 2
      description includes 3
    AND (All of):
      AND (All of):
        description includes 5
        description includes 6
        description includes 7
      NOT:
        description includes 7
```
<!-- endSnippet -->

## Styling explain results

### Default style

For readability, explanations are shown in a fixed-width font (a `PRE` block), and if the text is too wide for the screen a horizontal scrollbar is shown. Otherwise, testing showed that the explanations would be unusable on small-screen devices.

### Customizing the results

Using a [CSS snippet in Obsidian](https://help.obsidian.md/How+to/Add+custom+styles#Use+Themes+and+or+CSS+snippets), we can change the appearance of the explanation block.

For example, [this CSS snippet](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/gh-pages/resources/sample_vaults/Tasks-Demo/.obsidian/snippets/tasks-plugin-explain-text-blue.css) `tasks-plugin-explain-text-blue.css` makes the explanation block text blue:

<!-- snippet: resources/sample_vaults/Tasks-Demo/.obsidian/snippets/tasks-plugin-explain-text-blue.css -->
```css
/* Make the Tasks plugin's 'explain' output stand out in blue */
.plugin-tasks-query-explanation {
    color: var(--color-blue);
}
```
<!-- endSnippet -->
