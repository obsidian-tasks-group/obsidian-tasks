<!-- placeholder to force blank line before included text -->


Like "group by tags" except that tasks with no tags have no heading instead of "(No tags)":

~~~text
group by function task.tags
~~~


Tasks with multiple tags are listed once, with a heading that combines all the tags. Separating with commas means the tags are clickable in the headings:

~~~text
group by function task.tags.join(", ")
~~~


Only create headings for tags that contain "#context/":

~~~text
group by function task.tags.filter( (t) => t.includes("#context/"))
~~~


Create headings for all tags that do not contain "#tag":

~~~text
group by function task.tags.filter( (t) => ! t.includes("#tag"))
~~~



<!-- placeholder to force blank line after included text -->
