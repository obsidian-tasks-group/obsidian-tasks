<!-- placeholder to force blank line before included text -->


~~~text
group by function task.scheduled?.format("YYYY-MM-DD dddd") || ""
~~~

- Like "group by task.scheduled", except it does not write "No scheduled date" if there is no scheduled date. The question mark (`?`) and `|| ""` are needed because the scheduled date value may be null.



<!-- placeholder to force blank line after included text -->
