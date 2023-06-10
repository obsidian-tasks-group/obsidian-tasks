<!-- placeholder to force blank line before included text -->


~~~text
group by function task.done?.format("YYYY-MM-DD dddd") || ""
~~~

- Like "group by task.done", except it does not write "No done date" if there is no done date. The question mark (`?`) and `|| ""` are needed because the done date value may be null.



<!-- placeholder to force blank line after included text -->
