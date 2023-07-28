<!-- placeholder to force blank line before included text -->

- ```filter by function const taskDate = task.due.moment; const wanted = '2023-06-11'; return taskDate?.isSame(wanted, 'day') || ( !taskDate && task.heading?.includes(wanted)) || false```
    - Find takes that:
      - **either** due on the date `2023-06-11`,
      - **or** do not have a due date, and their preceding heading contains the same date as a string: `2023-06-11`.
    - Note that because we use variables to avoid repetition of values, we need to add `return`.
- ```filter by function const taskDate = task.due.moment; const now = moment(); return taskDate?.isSame(now, 'day') || ( !taskDate && task.heading?.includes(now.format('YYYY-MM-DD')) ) || false```
    - Find takes that:
      - **either** due on today's date,
      - **or** do not have a due date, and their preceding heading contains today's date as a string, formatted as `YYYY-MM-DD`.
- ```filter by function task.heading?.includes('#context/home') || task.tags.find( (tag) => tag === '#context/home' ) && true || false```
    - Find takes that:
      - **either** have a tag exactly matching `#context/home` on the task line,
      - **or** their preceding heading contains the text `#context/home` anywhere.
        - For demonstration purposes, this is slightly imprecise, in that it would also match nested tasks, such as `#context/home/ground-floor`.


<!-- placeholder to force blank line after included text -->
