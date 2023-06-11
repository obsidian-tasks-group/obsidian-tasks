<!-- placeholder to force blank line before included text -->


~~~text
group by function task.due.format("YYYY-MM-DD dddd")
~~~

- Like "group by task.due", except it uses an empty string instead of "No due date" if there is no due date.


~~~text
group by function task.due.formatAsDate()
~~~

- Format date as YYYY-MM-DD or empty string if no date.


~~~text
group by function task.due.formatAsDateAndTime()
~~~

- Format date as YYYY-MM-DD HH:mm or empty string if no date.


~~~text
group by function task.due.format("dddd")
~~~

- Group by day of the week (Monday, Tuesday, etc).


~~~text
group by function task.due.format("YYYY MM MMM", "no due date")
~~~

- Group by month, for example "2023 05 May". The month number is also displayed, to control the sort order of headings.


~~~text
group by function task.due.format("YYYY-MM MMM [- Week] WW", "no  date")
~~~

- Group by month and week number, for example "2023-05 May - Week 22", or show a default heading if no date. If the month number is not displayed, in some years the first or last week of the year is displayed in a non-logical order.


~~~text
group by function task.due.moment?.fromNow() || ""
~~~

- Group by the time from now, for example "8 days ago". Because Moment.fromNow() is not provided by TasksDate, we need special code for when there is no date value. Whilst interesting, the alphabetical sort order makes the headings a little hard to read.



<!-- placeholder to force blank line after included text -->
