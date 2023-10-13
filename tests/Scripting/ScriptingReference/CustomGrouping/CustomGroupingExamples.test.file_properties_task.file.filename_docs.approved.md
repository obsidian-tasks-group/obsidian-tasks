<!-- placeholder to force blank line before included text -->


```text
group by function task.file.filename
```

- Like 'group by filename' but does not link to the file.

```text
group by function task.file.filename.filenameWithoutExtension + (task.hasHeading ? (' > ' + task.heading) : '')
```

- Like 'group by backlink' but does not link to the heading in the file.


<!-- placeholder to force blank line after included text -->
