<!-- placeholder to force blank line before included text -->


```javascript
sort by function task.file.folder
```

- Enable sorting by the folder containing the task.

```javascript
sort by function reverse task.file.path === query.file.path
```

- Sort tasks in the same file as the query before tasks in other files.
- **Note**: `false` sort keys sort first, so we `reverse` the result, to get the desired results.


<!-- placeholder to force blank line after included text -->
