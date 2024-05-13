<!-- placeholder to force blank line before included text -->


```javascript
group by function task.due.format("dddd")
```

- Group by day of the week (Monday, Tuesday, etc).
- The day names are sorted alphabetically.

```javascript
group by function task.due.format("[%%]d[%%]dddd")
```

- Group by day of the week (Sunday, Monday, Tuesday, etc).
- The day names are sorted in date order, starting with Sunday.

```javascript
group by function                                   \
    const date = task.due;                          \
    if (!date.moment) {                             \
        return "Undated";                           \
    }                                               \
    if (date.moment.day() === 0) {                  \
        {{! Put the Sunday group last: }}           \
        return date.format("[%%][8][%%]dddd");      \
    }                                               \
    return date.format("[%%]d[%%]dddd");
```

- Group by day of the week (Monday, Tuesday, etc).
- The day names are sorted in date order, starting with Monday.
- Tasks without due dates are displayed at the end, under a heading "Undated".
- The key technique is to say that if the day is Sunday (`0`), then force it to be displayed as date number `8`, so it comes after the other days of the week.
- To add comments, we can use `{{! ... }}`
- To make the expression more readable, we put a `\` at the end of several lines, to continue the expression on the next line.

```javascript
group by function \
    const date = task.due.moment; \
    return \
        (!date)                           ? '%%4%% Undated' :      \
        !date.isValid()                   ? '%%0%% Invalid date' : \
        date.isBefore(moment(), 'day')    ? '%%1%% Overdue' :      \
        date.isSame(moment(), 'day')      ? '%%2%% Today'   :      \
        '%%3%% Future';
```

- This gives exactly the same output as `group by function task.due.category.groupText`, and is shown here in case you want to customise the behaviour in some way.
- Group task due dates in to 5 broad categories: `Invalid date`, `Overdue`, `Today`, `Future` and `Undated`, displayed in that order.
- Try this on a line before `group by due` if there are a lot of due date headings, and you would like them to be broken down in to some kind of structure.
- Note that because we use variables to avoid repetition of values, we need to add `return`

```javascript
group by function \
    const date = task.due.moment; \
    return \
        (!date)                           ? '%%4%% ==Undated==' :      \
        !date.isValid()                   ? '%%0%% ==Invalid date==' : \
        date.isBefore(moment(), 'day')    ? '%%1%% ==Overdue==' :      \
        date.isSame(moment(), 'day')      ? '%%2%% ==Today=='   :      \
        '%%3%% ==Future==';
```

- As above, but the headings `Invalid date`, `Overdue`, `Today`, `Future` and `Undated` are highlighted.
- See the sample screenshot below.

```javascript
group by function \
    const date = task.due.moment; \
    const now = moment(); \
    const label = (order, name) => `%%${order}%% ==${name}==`; \
    if (!date)                      return label(4, 'Undated'); \
    if (!date.isValid())            return label(0, 'Invalid date'); \
    if (date.isBefore(now, 'day'))  return label(1, 'Overdue'); \
    if (date.isSame(now, 'day'))    return label(2, 'Today'); \
    return label(3, 'Future');
```

- As above, but using a local function, and `if` statements.

```javascript
group by function \
    const date = task.due.moment; \
    const tomorrow  = moment().add(1,'days'); \
    const now = moment(); \
    const label = (order, name) => `%%${order}%% ==${name}==`; \
    if (!date)                           return label(5, 'Undated'); \
    if (!date.isValid())                 return label(0, 'Invalid date'); \
    if (date.isBefore(now, 'day'))       return label(1, 'Overdue'); \
    if (date.isSame(now, 'day'))         return label(2, 'Today'); \
    if (date.isSame(tomorrow, 'day'))    return label(3, 'Tomorrow'); \
    return label(4, 'Future');
```

- As above, but adds a heading for Tomorrow.


<!-- placeholder to force blank line after included text -->
