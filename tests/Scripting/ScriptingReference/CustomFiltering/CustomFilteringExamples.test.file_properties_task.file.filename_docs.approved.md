<!-- placeholder to force blank line before included text -->


```javascript
filter by function task.file.filename === "4.1.0 Release.md"
```

- Find tasks in files with the exact file name, but in any folder.
- The equality test, `===`, requires that the file extension `.md` be included.

```javascript
filter by function task.file.filename.includes("4.1.0 Release")
```

- Find tasks in files whose name contains the given text.
- By using `.includes()` and leaving out the file extension, this will also find files such as `14.1.0 Release.md` and `4.1.0 Release Notes.md`.


<!-- placeholder to force blank line after included text -->
