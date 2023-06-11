<!-- placeholder to force blank line before included text -->


~~~text
group by function task.created?.format("YYYY-MM-DD dddd") || ""
~~~

- Like "group by task.created", except it does not write "No created date" if there is no created date. The question mark (`?`) and `|| ""` are needed because the created date value may be null.



<!-- placeholder to force blank line after included text -->
