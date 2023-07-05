<!-- placeholder to force blank line before included text -->

- ```group by function task.due.moment?.fromNow() || ""```
    - Group by the time from now, for example "8 days ago".
    - Because Moment.fromNow() is not provided by TasksDate, we need special code for when there is no date value.
    - Whilst interesting, the alphabetical sort order makes the headings a little hard to read.
- ```group by function task.due.format("dddd")```
    - Group by day of the week (Monday, Tuesday, etc).
    - The day names are sorted alphabetically.
- ```group by function task.due.format("[%%]d[%%]dddd")```
    - Group by day of the week (Sunday, Monday, Tuesday, etc).
    - The day names are sorted in date order, starting with Sunday.
- ```group by function task.due.moment ? ( task.due.moment.day() === 0 ? task.due.format("[%%][8][%%]dddd") : task.due.format("[%%]d[%%]dddd") ) : "Undated"```
    - Group by day of the week (Monday, Tuesday, etc).
    - The day names are sorted in date order, starting with Monday.
    - Tasks without due dates are displayed at the end, under a heading "Undated".
    - This is best understood by pasting it in to a Tasks block in Obsidian and then deleting parts of the expression.
    - The key technique is to say that if the day is Sunday (`0`), then force it to be displayed as date number `8`, so it comes after the other days of the week.


<!-- placeholder to force blank line after included text -->
