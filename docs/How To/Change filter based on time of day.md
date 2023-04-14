---
publish: true
---

# Change filter based on time of day

<span class="related-pages">#css</span>

This example provides a way to change the filter being run based on the time of day.

````text
```tasks-sql
WHERE status->indicator = ' ' AND (
  moment()->isBetween(moment('08:00:00','hh:mm:ss'), moment('17:00:00','hh:mm:ss')) AND tags->includes('#Work')
OR
  NOT moment()->isBetween(moment('08:00:00','hh:mm:ss'), moment('17:00:00','hh:mm:ss')) AND tags->includes('#Home')
)
```
````
