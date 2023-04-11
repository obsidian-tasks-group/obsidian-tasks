---
publish: true
---

# SQL Debugging
<span class="related-pages">#css</span>

To help with debugging you can access the raw output of a query, you will need to create the entire `SELECT` query for this to work, the raw array is sent to the development console. Use `Ctrl+Shift+I` to open the console and look at the console log for the query output.

## Query with the Tasks in your Vault to query against

This example runs the SQL query with the tasks from this Vault.

    ```tasks-sql
    SELECT *, moment()->startOf('day') AS MomentDate, dueDate->getDate() AS DateDay
    FROM ?
    WHERE status->symbol = ' ' AND  moment()->format('YYYY-MM-DD') = moment(dueDate)->format('YYYY-MM-DD')
    LIMIT 1
    #raw tasks
    ```

```tasks-sql
SELECT *, moment()->startOf('day') AS MomentDate, dueDate->getDate() AS DateDay
FROM ?
WHERE status->symbol = ' ' AND  moment()->format('YYYY-MM-DD') = moment(dueDate)->format('YYYY-MM-DD')
LIMIT 1
#raw tasks
```

## Query with no data to query against

This example runs the SQL query as is with no data passed in so the entire SQL query has to return some information.

    ```tasks-sql
    SELECT moment() AS Moment, Date() AS JSDate, 'Some String' AS AString, 42 AS ANumber, 'Another String'->length AS ALength
    #raw empty
    ```

```tasks-sql
SELECT moment() AS Moment, Date() AS JSDate, 'Some String' AS AString, 42 AS ANumber, 'Another String'->length AS ALength
#raw empty
```

    ```tasks-sql
    SELECT *
    FROM tasks
    WHERE status->symbol = ' ' AND  moment()->format('YYYY-MM-DD') = moment(dueDate)->format('YYYY-MM-DD')
    LIMIT 1
    #raw tasks
    ```

```tasks-sql
SELECT *
FROM tasks
WHERE tags->includes('#Chores')
LIMIT 10
#raw tasks
```

    ```tasks-sql
    SELECT * FROM pagedata; SHOW TABLES FROM alasql
    #SELECT *, queryId(), queryBlockFile() FROM tasks LIMIT 10
    #SELECT queryId()
    #raw empty
    ```

```tasks-sql
SELECT * FROM pagedata; SHOW TABLES FROM alasql
#SELECT *, queryId(), queryBlockFile() FROM tasks LIMIT 10
#SELECT queryId()
#raw empty
```
