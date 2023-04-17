---
publish: true
---

# SQL Page properties

The following functions can be used in your query to get details about the page the query is running on.

- notePathWithFileExtension()
- notePath()
- noteFileName()

This will result in the following values if a query was run on this page.

```json
{  
  "notePathWithFileExtension": "Advanced/SQL Searches/SQL Page Properties.md",  
  "notePath": "Advanced/SQL Searches",  
  "noteFileName": "SQL Page Properties"  
}
```

For example if you make a page per day with the name using the pattern 'YYYY-MM-DD' you can run the following query to see all the due tasks for the day.

````text
```tasks-sql
WHERE dueDate->isSame(noteFileName())
```
````
