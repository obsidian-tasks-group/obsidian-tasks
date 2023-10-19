<!-- placeholder to force blank line before included text -->


```javascript
filter by function task.recurrenceRule.includes("every week")
```

- Similar to `recurrence includes every week`, but case-sensitive.

```javascript
filter by function !task.recurrenceRule.includes("every week")
```

- Similar to `recurrence does not include every week`, but case-sensitive.

```javascript
filter by function task.recurrenceRule.includes("every week") && task.recurrenceRule.includes("when done")
```

- Find tasks that are due every week, and **do** contain `when done` in their recurrence rule.

```javascript
filter by function task.recurrenceRule.includes("every week") && !task.recurrenceRule.includes("when done")
```

- Find tasks that are due every week, and do **not** contain `when done` in their recurrence rule.


<!-- placeholder to force blank line after included text -->
