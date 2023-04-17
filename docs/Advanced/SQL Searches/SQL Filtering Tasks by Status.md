---
publish: true
---

# SQL Filtering Tasks by Status

When using the tasks query engine to filter and sort by status it is allocating status types based on the value between the braces as well as allocating a specific sort order. To replicate this in the SQL query functions have been made available.

## Filtering

To filter by the status type and not the character between the braces you can use the following functions. You can see how the symbol maps to the types in [[Status Collections]].

- isToDo(status)
- isDone(status)
- isInProgress(status)
- isCancelled(status)
- isNonTask(status)

As an example the following query will return all tasks that are in progress.

````text
```tasks-sql  
WHERE isInProgress(status)
```  
````

You can also do this manually but would need to make a larger query, however this would allow you to decide to change a internal mapping of a symbol to a type. For example in the ITS Theme the letter `T` which stands for Time is marked with an internal status of Todo. If you wanted that to be In Progress you could do one of the the following queries.

````text
```tasks-sql  
WHERE isInProgress(status) OR status->symbol = 'T'
```  
````

````text
```tasks-sql  
CREATE FUNCTION myIsInProgress AS ``function(status) {return (status.type == 'IN_PROGRESS' || status.symbol == 'T'); }``;
WHERE myIsInProgress(status); 
#ml
```  
````

To return all the tasks that are not done you can use the following.

````text
```tasks-sql  
WHERE NOT isDone(status)
```  
````

## Ordering

To order by the internal designation used by tasks you can use the `statusTypeOrdering(status)` function. This orders the tasks as per this list.

1. In Progress
2. Todo
3. Done
4. Cancelled
5. Non Task
6. Empty

Example

````text
```tasks-sql  
ORDER BY statusTypeOrdering(status)
```  
````
