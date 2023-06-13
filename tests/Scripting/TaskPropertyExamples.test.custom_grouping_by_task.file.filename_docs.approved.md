<!-- placeholder to force blank line before included text -->

- ```group by function task.file.filename```
    - Like 'group by filename' but does not link to the file.
- ```group by function  '[[' + task.file.filename.replace('.md', '') + ( task.hasHeading ? ('#' + task.heading) : '')  + ']]'```
    - Like 'group by backlink' but links to the heading in the file.


<!-- placeholder to force blank line after included text -->
