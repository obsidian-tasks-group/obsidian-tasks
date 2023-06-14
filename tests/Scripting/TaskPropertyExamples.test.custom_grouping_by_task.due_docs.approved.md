<!-- placeholder to force blank line before included text -->

- ```group by function task.due.format("YYYY-MM-DD dddd")```
    - Like "group by task.due", except it uses no heading, instead of a heading "No due date", if there is no due date.
- ```group by function task.due.formatAsDate()```
    - Format date as YYYY-MM-DD or empty string (so no heading) if there is no due date.
- ```group by function task.due.formatAsDateAndTime()```
    - Format date as YYYY-MM-DD HH:mm or empty string if no due date.
    - Note:
        - This is shown for demonstration purposes.
        - Currently the Tasks plugin does not support storing of times.
        - Do not add times to your tasks, as it will break the reading of task data.
- ```group by function task.due.format("YYYY[%%]-MM[%%] MMM", "no due date")```
    - Group by month, for example `2023%%-05%% May` ...
        - ... which gets rendered by Obsidian as `2023 May`.
    - Or show a default heading "no due date" if no date.
    - The hidden month number is added, commented-out between two `%%` strings, to control the sort order of headings.
    - To escape characters in format strings, you can wrap the characters in square brackets (here, `[%%]`).
- ```group by function task.due.format("YYYY[%%]-MM[%%] MMM [- Week] WW")```
    - Group by month and week number, for example `2023%%-05%% May - Week 22` ...
        - ... which gets rendered by Obsidian as `2023 May - Week 22`.
    - If the month number is not embedded, in some years the first or last week of the year is displayed in a non-logical order..
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
