<!-- placeholder to force blank line before included text -->


~~~text
group by function task.happens?.format("YYYY-MM-DD dddd") || ""
~~~

- Like "group by task.happens", except it does not write "No happens date" if none of task.start, task.scheduled, and task.due are set. The question mark (`?`) and `|| ""` are needed because the happens date value may be null.



<!-- placeholder to force blank line after included text -->
