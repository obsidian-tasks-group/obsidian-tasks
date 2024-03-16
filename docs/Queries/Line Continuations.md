---
publish: true
---

# Line Continuations

> [!released]
>
> - Introduced in Tasks 5.0.0.
> - **Important**: This facility changed the meaning of a final backslash (`\`) character on a query line. See [[#Appendix Updating pre-5.0.0 searches with trailing backslashes]] below to update queries.

## Wrap long lines in queries

In Tasks code blocks, **a backslash (`\`)** is a 'line continuation character'. If a backslash is placed at the end of a line, the line is considered to continue on the next line.

This is useful for dividing up long queries across multiple lines, for better readability.

For example this query:

<!-- snippet: DocsSamplesForExplain.test.explain_line_continuation_-_single_slash.approved.query.text -->
```text
(priority is highest) OR       \
    (priority is lowest)
explain
```
<!-- endSnippet -->

... runs this search:

<!-- snippet: DocsSamplesForExplain.test.explain_line_continuation_-_single_slash.approved.explanation.text -->
```text
Explanation of this Tasks code block query:

  (priority is highest) OR       \
      (priority is lowest)
   =>
  (priority is highest) OR (priority is lowest) =>
    OR (At least one of):
      priority is highest
      priority is lowest

  No grouping instructions supplied.

  No sorting instructions supplied.
```
<!-- endSnippet -->

This facility will be helpful for long [[Combining Filters]], [[Custom Sorting]], and [[Custom Grouping]] lines, and other queries that may be difficult to read on one line.

There are some more realistic examples towards the end of the [[Grouping#Due Date|Due date custom grouping examples]].

Points to note:

- To be a continuation character, the `\` must be the **very last character** on the line.
- All the `\` and all whitespace around it is compressed down to a single space.
- Consider indenting the second and subsequent lines, so the structure of the query is immediately clear.
- Consider aligning the `\` characters for readability.
- If in doubt, add the `explain` instruction to inspect how your code block is interpreted.

## Searches needing a trailing backslash

In Tasks code blocks, **two backslashes (`\\`) at the very end of a line** are treated as a **single backslash**.

This enables searching in the rare case that a trailing backslash is needed for a query.

For example this query:

<!-- snippet: DocsSamplesForExplain.test.explain_line_continuation_-_double_slash.approved.query.text -->
```text
# Search for a single backslash:
description includes \\
explain
```
<!-- endSnippet -->

... runs this search:

<!-- snippet: DocsSamplesForExplain.test.explain_line_continuation_-_double_slash.approved.explanation.text -->
```text
Explanation of this Tasks code block query:

  description includes \\ =>
  description includes \

  No grouping instructions supplied.

  No sorting instructions supplied.
```
<!-- endSnippet -->

Points to note:

- Alternatively, you can add one or more spaces after the trailing `\` to prevent it being continuation character.
  - This is risky though, as some editors and linters remove unnecessary trailing spaces.
  - So the **two backslashes option is safer**.
- If in doubt, add the `explain` instruction to inspect how your code block is interpreted.

## Appendix: Updating pre-5.0.0 searches with trailing backslashes

> [!Warning]
> In Tasks 5.0.0 the meaning of a **final backslash (`\`) character** on a query line changed **from**:
>
> - `search for a backslash character`
>
> **to:**
>
> - `join the next query line to this one`
>
> To retain the previous search behaviour, use `\\` at the end of query lines instead of `\`.
>
> For example:
>
> | Old instruction                   | Use this instruction instead       |
> | --------------------------------- | ---------------------------------- |
> | `description includes something\` | `description includes something\\` |
>
> For details, see [[Line Continuations#Searches needing a trailing backslash|Searches needing a trailing backslash]] in [[Line Continuations]].
