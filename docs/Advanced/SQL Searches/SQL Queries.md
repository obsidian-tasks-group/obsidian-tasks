---
publish: true
---

# SQL Queries

<span class="related-pages">#advanced/sql-search</span>

The SQL query version is more complex but provides more powerful ways to filter your tasks. There are a couple of key differences:

- The language is SQL based, if you know SQL you can use pretty much any query you can use in SQL.
- You do not need to specify the `SELECT` part of the query, you can start with `WHERE`
- The `GROUP BY` statement is not currently supported, support will be added at a later time.

By default you should only need the conditions of the SQL query, that is everything after the `WHERE` clause including the `WHERE` for example `WHERE status->symbol != "x" AND path LIKE '%Journal%' LIMIT 10` which will return 10 tasks not completed (`x`) with `Journal` in the path.

## General Queries

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
