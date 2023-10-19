<!-- placeholder to force blank line before included text -->


```javascript
group by function task.file.folder
```

- Same as 'group by folder'.

```javascript
group by function task.file.folder.slice(0, -1).split('/').pop() + '/'
```

- Group by the immediate parent folder of the file containing task.
- Here's how it works:
    - '.slice(0, -1)' removes the trailing slash ('/') from the original folder.
    - '.split('/')' divides the remaining path up in to an array of folder names.
    - '.pop()' returns the last folder name, that is, the parent of the file containing the task.
    - Then the trailing slash is added back, to ensure we do not get an empty string for files in the top level of the vault.


<!-- placeholder to force blank line after included text -->
