<!-- placeholder to force blank line before included text -->


```javascript
filter by function task.file.path.includes('tasks releases/4.1.0 Release.md')
```

- Like 'path includes', except that it is **case-sensitive**: capitalisation matters.

```javascript
filter by function task.file.path === 'tasks releases/4.1.0 Release.md'
```

- An exact, **case-sensitive**, equality search.
- Note that the file extension needs to be included too.
- With built-in searches, this could only be done using a regular expression, with special characters `^` and `$`, and escaping any characters with special meaning such as `/`.

```javascript
filter by function task.file.path.toLocaleLowerCase() === 'TASKS RELEASES/4.1.0 RELEASE.MD'.toLocaleLowerCase()
```

- An exact, **non**-case-sensitive, equality search.
- By lower-casing both values, we do not have to worry about manually lower-casing them in our query.


<!-- placeholder to force blank line after included text -->
