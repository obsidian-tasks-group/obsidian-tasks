---
publish: true
---

# SQL Examples

<span class="related-pages">#advanced/sql-search</span>

## Filtering on Tags

This will return all the tasks with `#wf` in the tags.

````text
```tasks-sql  
WHERE '#wf' IN tags
```  
````

---

## All open tasks that are due today and marked at important as the status

This will match a task like below assuming todays dat is 2023-10-11.

- [!] #task Important Task 📅 2023-10-11

````text
```tasks-sql
WHERE status->symbol = '!' AND  moment()->[format]('YYYY-MM-DD') = moment(dueDate)->[format]('YYYY-MM-DD')
```
````

---

## All open tasks that are due within the next two weeks, but are not overdue (due today or later)

````text
```tasks-sql
WHERE status->symbol = ' ' AND moment(dueDate)->isBetween(moment()->startOf('day').subtract(1, 'days'), moment()->startOf('day').add(14, 'days'))
```
````

---

## All done tasks that are anywhere in the vault under a `tasks` heading (e.g. `## Tasks`)

````text
```tasks-sql
WHERE status->symbol = 'x' AND precedingHeader LIKE '%tasks%'
```
````

---

## Show all tasks that aren’t done, are due on the 9th of April 2021, and where the path includes `GitHub`

````text
```tasks-sql
WHERE status->symbol = ' '
AND dueDate = DATE('2021-04-09')
AND path LIKE '%GitHub%'
```
````

---

## All tasks with waiting, waits or wartet

````text
```tasks-sql
WHERE description LIKE '%waiting%' OR description LIKE '%waits%' OR description LIKE '%wartet%'
#short
```
````

---

## All tasks with 'trash' in the description

````text
```tasks-sql
WHERE description LIKE '%trash%'
```
````
