<!-- placeholder to force blank line before included text -->


~~~text
group by function task.start?.format("YYYY-MM-DD dddd") || ""
~~~

- Like "group by task.start", except it does not write "No start date" if there is no start date. The question mark (`?`) and `|| ""` are needed because the start date value may be null.



<!-- placeholder to force blank line after included text -->
