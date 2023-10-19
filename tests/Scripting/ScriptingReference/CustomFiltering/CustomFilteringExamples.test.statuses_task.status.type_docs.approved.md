<!-- placeholder to force blank line before included text -->


```javascript
filter by function task.status.type === 'NON_TASK'
```

- Find tasks of type `NON_TASK`.

```javascript
filter by function 'TODO,IN_PROGRESS'.includes(task.status.type)
```

- Find tasks that are either type `TODO` or type `IN_PROGRESS`.
- This can be more convenient than doing Boolean `OR` searches.

```javascript
filter by function ! 'NON_TASK,CANCELLED'.includes(task.status.type)
```

- Find tasks that are not type `NON_TASK` and not type `CANCELLED`.


<!-- placeholder to force blank line after included text -->
