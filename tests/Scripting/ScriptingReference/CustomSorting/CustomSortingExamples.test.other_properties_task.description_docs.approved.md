<!-- placeholder to force blank line before included text -->


```javascript
sort by function task.description.length
```

- Sort by length of description, shortest first.
- This might be useful for finding tasks that need more information, or could be made less verbose.

```javascript
sort by function task.description.replace('🟥', 1).replace('🟧', 2).replace('🟨', 3).replace('🟩', 4).replace('🟦', 5)
```

- A user has defined custom system for their task descriptions, with coloured squares at the **start** of task lines as a home-grown alternative priority system.
- This allows tasks to be sorted in the order of their coloured squares.


<!-- placeholder to force blank line after included text -->
