<!-- placeholder to force blank line before included text -->


```javascript
group by function (task.heading + '.md' === task.file.filename) ? '' : task.heading
```

- Group by heading, but only if the heading differs from the file name.
- This works well immediately after a 'group by filename' line.
- Note the three equals signs '===': these are important for safety in JavaScript.


<!-- placeholder to force blank line after included text -->
