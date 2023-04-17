---
publish: true
---

# Limiting

<span class="related-pages">#advanced/sql-search</span>

To limit the results the LIMIT clause is used, it is possible to use TOP but that requires more advanced knowledge of the plugin so not recommended.

The following query will list 3 tasks due from today.

````text
```tasks-sql
WHERE status->symbol = 'x'
  AND dueDate->isAfter(moment()->startOf('day'))
LIMIT 3
```
````
