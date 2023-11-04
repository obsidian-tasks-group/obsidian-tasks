<!-- placeholder to force blank line before included text -->


```javascript
filter by function task.status.symbol === '-'
```

- Find tasks with a checkbox `[-]`, which is conventionally used to mean "cancelled".

```javascript
filter by function task.status.symbol !== ' '
```

- Find tasks with anything but the space character as their status symbol, that is, without the checkbox `[ ]`.

```javascript
filter by function \
    const symbol = task.status.symbol; \
    return symbol === 'P' || symbol === 'C' || symbol === 'Q' || symbol === 'A';
```

- Note that because we use a variable to avoid repetition, we need to add `return`
- Find tasks with status symbol `P`, `C`, `Q` or `A`.
- This can get quite verbose, the more symbols you want to search for.

```javascript
filter by function 'PCQA'.includes(task.status.symbol)
```

- Find tasks with status symbol `P`, `C`, `Q` or `A`.
- This is a convenient shortcut over a longer statement testing each allowed value independently.

```javascript
filter by function !' -x/'.includes(task.status.symbol)
```

- Find tasks with any status symbol not supported by Tasks in the default settings.


<!-- placeholder to force blank line after included text -->
