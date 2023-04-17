# SQL Directives and Comments

There are a few directives you can use with the queries, some of these are the same as the normal tasks query and have the same outcome.

When a directive is provided it needs to start with the `#` symbol, these are removed before the query execution so can also be used for commenting.

Directives with the leading `#` symbol can be placed at any line in the code block.

## Comments

Here is an example of adding a comment to a query, it will be removed before parsing.

````text
```tasks-sql
# This query will return all tasks with the #wf tag.
WHERE '#wf' IN tags
```  
````

## Short Mode

This returns the tasks in a shortened format just link the `short mode` command in the tasks queries. See [[Layout#Short Mode]] for more details.

````text
```tasks-sql
# This query will return all tasks with the #wf tag with short mode enabled.
#short
WHERE '#wf' IN tags
```  
````

## Hiding/Showing Elements

You can hide and show individual elements of the rendered list with the `#hide` and `#show` commands together with the name of the element. This is the same as the normal tasks functionality. See [[Layout#Hiding/Showing Elements]] for more details.

````text
```tasks-sql
# This query will return all tasks with the #wf tag with short mode enabled.
#short
WHERE '#wf' IN tags
#hide backlink
#hide edit button
```  
````
