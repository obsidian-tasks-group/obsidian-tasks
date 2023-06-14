# Use formatting in custom group headings

This is a quite a sophisticated example of [Custom Grouping](https://publish.obsidian.md/tasks/Scripting/Custom+Grouping), saved here so that it can be used to create screenshots for the documentation.

```tasks
limit groups 4

not done

# First group level:
# Show Year then Month, and then week number.
# Draw the fixed text paler, to de-emphasize it.
group by function task.due.format("YYYY %%MM%% MMMM [<mark style='background: var(--color-base-00); color: var(--color-base-40)'>- Week</mark>] WW", "Undated")

# Second group level:
# Show the day of the week, then the date in paler text.
group by function task.due.format("[%%]YYYY-MM-DD[%%]dddd [<mark style='background: var(--color-base-00); color: var(--color-base-40);'>](YYYY-MM-DD)[</mark>]")
short mode
```
