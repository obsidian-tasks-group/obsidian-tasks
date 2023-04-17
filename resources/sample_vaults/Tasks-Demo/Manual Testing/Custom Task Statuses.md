# Custom Task Statuses

## Standard Markdown statuses

These are the standard markdown statuses:

- [ ] #task I am Todo `space`
- [x] #task I am Done `x`

## Core Tasks  statuses

These are the core statuses in Tasks.

- [ ] #task I am Todo `space`
- [x] #task I am Done `x`
- [/] #task I am In Progress `/`
- [-] #task I am Cancelled `-`

## Selection of custom Tasks statuses

- [X] #task  I am Checked `X`
- [!] #task  I am Important `!`
- [P] #task  I am Pro `P`
- [C] #task  I am Con `C`

---

## group by status

```tasks
path includes Custom Task Statuses
group by status
sort by description
```

Task SQL Query Version

```tasks-sql
WHERE path LIKE '%Custom Task Statuses%'
```

---

## sort by status

```tasks
path includes Custom Task Statuses
sort by status
sort by description
```

Task SQL Query Version

When the tasks query is run it only sorts status by Done and Todo, the SQL engine will sort by the actual status as it stand today as there is no need for backwards compatibility.

```tasks-sql
WHERE path LIKE '%Custom Task Statuses%' ORDER BY status->symbol, description
```

---

## Done

```tasks
path includes Custom Task Statuses
done
sort by description
```

Task SQL Query Version

SQL will filter by the exact state of the task and not assume any character between the square braces is 'Done' like the existing tasks query engine.

Just tasks that are 'Done' == 'x'

```tasks-sql
WHERE status->symbol = 'x' AND path LIKE '%Custom Task Statuses%' ORDER BY description
```

Just tasks that are 'Cancelled' == '-'

```tasks-sql
WHERE status->symbol = '-' AND path LIKE '%Custom Task Statuses%' ORDER BY description
```

---

## Not Done

```tasks
path includes Custom Task Statuses
not done
sort by description
```

Task SQL Query Version

SQL will filter by the exact state of the task and not assume any character not set to 'x' is not done.

```tasks-sql
WHERE status->symbol = ' ' AND path LIKE '%Custom Task Statuses%' ORDER BY description
```

All Tasks that have a status that is not 'x'

```tasks-sql
WHERE status->symbol <> 'x' AND path LIKE '%Custom Task Statuses%' ORDER BY description
```
