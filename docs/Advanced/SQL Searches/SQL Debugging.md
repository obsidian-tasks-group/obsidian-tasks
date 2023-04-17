---
publish: true
---

# SQL Debugging

<span class="related-pages">#advanced/sql-search</span>

To help with debugging you can access the raw output of a query. The raw mode of output allows you to just make a query without using the collection of tasks in Obsidian to query against as well as being able to run the query against all the task.

## Query with the Tasks in your Vault to query against

This example runs the SQL query with the tasks from this Vault. By placing `tasks` after the `#raw` command all the tasks in your vault that the tasks plugin knows about wil be used as the query target. When this query is run it will return one tasks matching the `WHERE` clause. The data returned is the `description`, `MomentDate` which is the start of the day today and if a `dueDate` is set its current value as a string.

````text
```tasks-sql
SELECT description, moment()->startOf('day') AS MomentDate, dueDate->format() AS DateDay
FROM ?
WHERE status->symbol = ' ' 
LIMIT 1
#raw tasks
```
````

## Query with no data to query against

This example runs the SQL query as is with no data passed in so the entire SQL query has to return some information. You can use this to play with the functions and moment formatting as needed to see what the output looks like. As the SQL engine can query against JavaScript objects you can also add them as the data to query.

````text
```tasks-sql
SELECT moment() AS Moment, Date() AS JSDate, 'Some String' AS AString, 42 AS ANumber, 'Another String'->length AS ALength
#raw empty
```
````

This query will return all the internal tables avaliable to be joined against, there is only currently one by default called `pagedata`. It will contain data from the page that is running the query.

````text
```tasks-sql
SHOW TABLES FROM alasql
#raw empty
```
````

This query will set data in a variable called `@data`, it will then run a query against it. These data returned in the console will be an array with results for the set and then the select statements. The second index has the results of the query.

````text
```tasks-sql
SET @data = @[{a:'1',b:'some data'},{a:'2',b:'some more data'}];
SELECT a, b FROM @data;
#raw empty
```
````

Result you will see in the console.

```json
[
    1,
    [
        {
            "a": "1",
            "b": "some data"
        },
        {
            "a": "2",
            "b": "some more data"
        }
    ]
]
```
