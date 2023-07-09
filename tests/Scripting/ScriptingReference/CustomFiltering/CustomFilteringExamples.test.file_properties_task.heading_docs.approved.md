<!-- placeholder to force blank line before included text -->

- ```filter by function task.due.moment?.isSame('2023-06-11', 'day') || ( !task.due.moment && task.heading?.includes('2023-06-11')) || false```
    - Find takes that:
      - **either** due on the date `2023-06-11`,
      - **or** do not have a due date, and their preceding heading contains the same date as a string: `2023-06-11`.
- ```filter by function task.due.moment?.isSame(moment(), 'day') || ( !task.due.moment && task.heading?.includes(moment().format('YYYY-MM-DD')) ) || false```
    - Find takes that:
      - **either** due on today's date,
      - **or** do not have a due date, and their preceding heading contains today's date as a string, formatted as `YYYY-MM-DD`.
- ```filter by function task.heading?.includes('#context/home') || task.tags.find( (tag) => tag === '#context/home' ) && true || false```
    - Find takes that:
      - **either** have a tag exactly matching `#context/home` on the task line
      - **or** their preceding heading contains the text `#context/home` anywhere
        - For demonstration purposes, this is slightly imprecise, in that it would also match nested tasks, such as `#context/home/ground-floor`.


<!-- placeholder to force blank line after included text -->
