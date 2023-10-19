<!-- placeholder to force blank line before included text -->


```javascript
filter by function task.isRecurring
```

- This is identical to `is recurring`.
- It can be used with `&&` (Boolean AND) or `||` (Boolean OR) in conjunction with other conditions.

```javascript
filter by function !task.isRecurring
```

- This is identical to `is not recurring`.
- It can be used with `&&` (Boolean AND) or `||` (Boolean OR) in conjunction with other conditions.

```javascript
filter by function (!task.isRecurring) && task.originalMarkdown.includes('🔁')
```

- Find tasks that have a **broken/invalid recurrence rule**.
- This assumes use of the Tasks emoji format, and should of course be updated if using another format.
- This uses knowledge of an implementation detail of Tasks, which is that recurrence rules are read and removed from the description even if they are invalid.
- So we have to search for the recurrence marker in `task.originalMarkdown` to see whether the original task contained the recurrence signifier when `task.isRecurring` even though false.


<!-- placeholder to force blank line after included text -->
