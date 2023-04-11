---
publish: true
---

# SQL Queries

<span class="related-pages">#css</span>

The SQL query version is more complex but provides more powerful ways to filter your tasks. There are a couple of key differences:

- The language is SQL based, if you know SQL you can use pretty much any query you can use in SQL.
- If you want to make a fully custom query you need to select all the columns `*` at the moment unless you are grouping by. Selection of individual fields to generate a table is a future feature.

By default you should only need the conditions of the SQL query, that is everything after the `WHERE` clause including the `WHERE` for example `WHERE status->symbol != "x" AND path LIKE '%Journal%' LIMIT 10` which will return 10 tasks not completed (`x`) with `Journal` in the path.

## General Queries

### Queries using file

basename is the name of the page

`WHERE status->symbol = '!' AND file->basename = '2021-10-13'`

%%
Update if TFile becomes available on the Task object.
You can also now query based on the creation date of the note the task is in.

`WHERE status->symbol = ' ' AND moment(file->stat->ctime)->month() = 3`

you can use `mtime` to access the modified time.
%%
### Object Properties & Functions

Object property

- a -> b
- a -> b -> c

Array member

- a -> 1
- a -> 1 -> 2

Calculated property name

- a -> (1+2)
- a -> ("text2 + " " + "more")

Functions

- myTime -> getFullYear()
- s -> substr(1,2)

-

JavaScript string functions can also be used, for example all tasks with only one tag.

`WHERE tags->length = 1`

## Grouping Internals

To group you need to specify the field and then `ARRAY(_) AS tasks` this will be more flexible over time but to get parity with the existing Tasks plugin it is constrained to a single group. The query is generated in the background correctly for this and the data is grouped specially.

```SQL
GROUP BY status->symbol
```

becomes this internally where the ARRAY is the tasks in the status group.

```SQL
SELECT status, ARRAY(_) AS tasks FROM Tasks GROUP BY status
```
