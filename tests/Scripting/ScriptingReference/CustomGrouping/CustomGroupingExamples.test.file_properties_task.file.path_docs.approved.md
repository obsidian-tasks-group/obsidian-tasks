<!-- placeholder to force blank line before included text -->


```javascript
group by function task.file.path
```

- Like 'group by path' but includes the file extension.

```javascript
group by function task.file.path.replace(query.file.folder, '')
```

- Group by the task's file path, but remove the query's folder from the group.
- For tasks in the query's folder or a sub-folder, this is a nice way of seeing shortened paths.
- This is provided to give ideas: it's a bit of a lazy implementation, as it doesn't check that `query.file.folder` is at the start of the line.


<!-- placeholder to force blank line after included text -->
