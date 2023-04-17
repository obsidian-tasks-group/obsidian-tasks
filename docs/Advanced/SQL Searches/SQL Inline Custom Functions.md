# SQL Inline Custom Functions

To extend the logic of the queries you can use custom functions. This is an alternative to using CustomJS which is currently not enabled.

This query creates a function that takes a date and returns true if the date is in the last seven days. In this example the `dueDate` is used as the property to check.

> ![Note]
> As this is a multi line query with more than the `SELECT` / `WHERE` clause you need to use `#ml` as a directive. This ensure only the last query is returned.

````text
```tasks-sql
CREATE FUNCTION inLastSevenDays AS ``function(date) {return date ? date.isBetween(window.moment().subtract(7, 'days'), window.moment()) : false; }``;
WHERE inLastSevenDays(dueDate); 
#ml
```
````

## CustomJS plugin integration

> ![Note]
> This integration is currently disabled and will be revisited in future updates.
