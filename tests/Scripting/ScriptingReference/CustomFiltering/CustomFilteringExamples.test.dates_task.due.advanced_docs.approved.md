<!-- placeholder to force blank line before included text -->


```javascript
filter by function \
    const date = task.due.moment; \
    return date ? !date.isValid() : false;
```

- Like `due date is invalid`.
- It matches tasks that have a due date and the due date is invalid, such as `2022-13-32`

```javascript
filter by function task.due.moment?.isSameOrBefore(moment(), 'day') || false
```

- Find all tasks due today or earlier.
- `moment()` returns the current date and time, which we need to convert to the start of the day.
- As the second parameter determines the precision, and not just a single value to check, using 'day' will check for year, month and day.
- See the documentation of [isSameOrBefore](https://momentjscom.readthedocs.io/en/latest/moment/05-query/04-is-same-or-before/).

```javascript
filter by function task.due.moment?.isSameOrAfter(moment(), 'day') || false
```

- Due today or later.

```javascript
filter by function task.due.moment?.isSame(moment('2023-05-31'), 'day') || false
```

- Find all tasks due on 31 May 2023.

```javascript
filter by function task.due.moment?.isSame(moment('2023-05-31'), 'week') || false
```

- Find all tasks due in the week of 31 May 2023.


<!-- placeholder to force blank line after included text -->
