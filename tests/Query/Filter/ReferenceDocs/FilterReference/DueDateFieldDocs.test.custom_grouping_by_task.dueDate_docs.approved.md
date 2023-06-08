<!-- placeholder to force blank line before included text -->


~~~text
group by function task.dueDate?.format("YYYY-MM-DD dddd") || ""
~~~

- Like "group by task.due", except it does not write "No due date" if there is no due date. The question mark (`?`) and `|| ""` are needed because the due date value may be null.


~~~text
group by function task.dueDate?.format("dddd") || ""
~~~

- Group by day of the week (Monday, Tuesday, etc).


~~~text
group by function task.dueDate?.format("YYYY MM MMM") || "no due date"
~~~

- Group by month, for example "2023 05 May". The month number is also displayed, to control the sort order of headings.


~~~text
group by function task.dueDate?.format("YYYY-MM MMM [- Week] WW") || "no  date"
~~~

- Group by month and week number, for example "2023-05 May - Week 22", or show a default heading if no date. If the month number is not displayed, in some years the first or last week of the year is displayed in a non-logical order.


~~~text
group by function task.dueDate?.fromNow() || ""
~~~

- Group by the time from now, for example "8 days ago". Whilst interesting, the alphabetical sort order makes the headings a little hard to read.



<!-- placeholder to force blank line after included text -->
