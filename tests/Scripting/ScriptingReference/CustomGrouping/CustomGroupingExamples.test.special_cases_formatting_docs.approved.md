<!-- placeholder to force blank line before included text -->


```javascript
group by function task.due.format("YYYY %%MM%% MMMM [<mark style='background: var(--color-base-00); color: var(--color-base-40)'>- Week</mark>] WW", "Undated")
```

- Show Year then Month, and then week number. Draw the fixed text paler, to de-emphasize it.

```javascript
group by function task.due.format("[%%]YYYY-MM-DD[%%]dddd [<mark style='background: var(--color-base-00); color: var(--color-base-40);'>](YYYY-MM-DD)[</mark>]")
```

- Show the day of the week, then the date in paler text.


<!-- placeholder to force blank line after included text -->
