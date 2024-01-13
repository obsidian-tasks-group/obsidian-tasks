<!-- placeholder to force blank line before included text -->


```javascript
sort by function task.description.length
```

- Sort by length of description, shortest first.
- This might be useful for finding tasks that need more information, or could be made less verbose.

```javascript
sort by function \
    const priorities = [...'🟥🟧🟨🟩🟦'];  \
    for (let i = 0; i < priorities.length; i++) {  \
        if (task.description.includes(priorities[i])) return i;  \
    }  \
    return 999;
```

- A user has defined a custom system for their task descriptions, with coloured squares as a home-grown alternative priority system.
- This allows tasks to be sorted in the order of their coloured squares.
- The function returns 0 if the first square is found in the task description, 1 if the second square is found, and so on.
- And it returns `999` if none of the squares are found.
- It is important that we use a consistent value for all the tasks not containing any of the squares, to retain their original order, so that any later `sort by` instructions still work.


<!-- placeholder to force blank line after included text -->
