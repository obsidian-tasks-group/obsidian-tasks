<!-- placeholder to force blank line before included text -->


```javascript
sort by function task.tags.filter( (tag) => tag.includes("#context/")).sort().join(",")
```

- Sort by tags that contain "#context/".
- Any tasks without that tag are sorted first.

```javascript
sort by function reverse task.tags.length
```

- Sort by the number of tags on the task.
- The `reverse` option puts tasks with the most tags first.

```javascript
sort by function -task.tags.length
```

- A different way of sorting by the number of tags on the task, still putting tasks with the most tags first.


<!-- placeholder to force blank line after included text -->
