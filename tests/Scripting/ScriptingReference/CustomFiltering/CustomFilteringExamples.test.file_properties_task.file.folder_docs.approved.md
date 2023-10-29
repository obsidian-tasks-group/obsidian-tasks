<!-- placeholder to force blank line before included text -->


```javascript
filter by function task.file.folder === "Work/Projects/"
```

- Find tasks in files in any file in the given folder **only**, and not any sub-folders.
- The equality test, `===`, requires that the trailing slash (`/`) be included.

```javascript
filter by function task.file.folder.includes("Work/Projects/")
```

- Find tasks in files in a specific folder **and any sub-folders**.

```javascript
filter by function task.file.folder.includes( query.file.folder )
```

- Find tasks in files in the folder that contains the query **and any sub-folders**.

```javascript
filter by function task.file.folder === query.file.folder
```

- Find tasks in files in the folder that contains the query only (**not tasks in any sub-folders**).

```javascript
filter by function task.file.folder.includes("Work/Projects")
```

- By leaving off the trailing slash (`/`) this would also find tasks in any file inside folders such as:
    - `Work/Projects 2023/`
    - `Work/Projects Top Secret/`


<!-- placeholder to force blank line after included text -->
