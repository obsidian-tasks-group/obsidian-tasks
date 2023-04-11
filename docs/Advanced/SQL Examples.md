---
publish: true
---

# SQL Examples
<span class="related-pages">#css</span>

## Filtering on Tags

    ```tasks-sql
    WHERE '#MindCare' IN tags
    ```

```tasks-sql
WHERE '#MindCare' IN tags

```

## All open tasks that are due today

    ```tasks
    WHERE status->symbol = '!' AND  moment()->[format]('YYYY-MM-DD') = moment(dueDate)->[format]('YYYY-MM-DD')
    ```

```tasks-sql
WHERE status->symbol = '!' AND  moment()->[format]('YYYY-MM-DD') = moment(dueDate)->[format]('YYYY-MM-DD')
```

---

## All open tasks that are due within the next two weeks, but are not overdue (due today or later)

    ```tasks-sql
    WHERE status->symbol = ' ' AND moment(dueDate)->isBetween(moment()->startOf('day').subtract(1, 'days'), moment()->startOf('day').add(14, 'days'))

    ```

```tasks-sql
WHERE status->symbol = ' ' AND moment(dueDate)->isBetween(moment()->startOf('day').subtract(1, 'days'), moment()->startOf('day').add(14, 'days'))

```

---

## All done tasks that are anywhere in the vault under a `tasks` heading (e.g. `## Tasks`)

    ```tasks-sql
    WHERE status->symbol = 'x' AND precedingHeader LIKE '%tasks%'
    ```

```tasks-sql
WHERE status->symbol = 'x' AND precedingHeader LIKE '%tasks%'
```

---

## Show all tasks that aren’t done, are due on the 9th of April 2021, and where the path includes `GitHub`

    ```tasks-sql
    WHERE status->symbol = ' '
    AND dueDate = DATE('2021-04-09')
    AND path LIKE '%GitHub%'
    ```

```tasks-sql
WHERE status->symbol = ' '
AND dueDate = DATE('2021-04-09')
AND path LIKE '%GitHub%'
```

---

## All tasks with waiting, waits or wartet

    ```tasks-sql
    WHERE description LIKE '%waiting%' OR description LIKE '%waits%' OR description LIKE '%wartet%'
    #short
    ```

```tasks-sql
WHERE description LIKE '%waiting%' OR description LIKE '%waits%' OR description LIKE '%wartet%'
#short
```

---

## All tasks with 'trash' in the description

    ```tasks-sql
    WHERE description LIKE '%trash%'
    ```

```tasks-sql
WHERE description LIKE '%trash%'
```
