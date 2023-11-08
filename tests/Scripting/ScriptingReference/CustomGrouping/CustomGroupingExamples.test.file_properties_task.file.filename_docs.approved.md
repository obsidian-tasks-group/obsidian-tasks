<!-- placeholder to force blank line before included text -->


```javascript
group by function task.file.filename
```

- Like 'group by filename' but does not link to the file.

```javascript
group by function task.file.filenameWithoutExtension + (task.hasHeading ? (' > ' + task.heading) : '')
```

- Like 'group by backlink' but does not link to the heading in the file.


<!-- placeholder to force blank line after included text -->
