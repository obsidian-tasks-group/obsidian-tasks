---
publish: true
---

# Sorting

<span class="related-pages">#advanced/sql-search</span>

There is no default sorting for the SQL based queries, if you want to have a order you need to specify it.

## Using  `ORDER BY`

Syntax:

    ORDER BY expression1 [ASC|DESC], ...

You can specify order with keywords:

- `ASC` - ascending (by default)
- `DESC` - descending

The expression can be any of the columns available to you.

This example returns all the completed tasks ordering by due date and then done date.

````text
```tasks-sql
WHERE status->symbol = 'x'
ORDER BY dueDate DESC, doneDate DESC
```
````

## Ordering by description without markdown

By default the description contains markdown, to query the rendered string you need to remove the markdown when ordering. To make this simpler there is a function that will do it for you.

This will work for any string passed to the `removeMarkdown(field)` function.

````text
```tasks-sql
WHERE status->symbol = ' '
ORDER BY removeMarkdown(description) ASC, dueDate DESC
```
````
