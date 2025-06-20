# <% tp.file.title %>
<%*
  let yesterday = tp.date.now("YYYY-MM-DD", -1, tp.file.title, "YYYY-MM-DD")
  let today     = tp.date.now("YYYY-MM-DD",  0, tp.file.title, "YYYY-MM-DD")
  let tomorrow  = tp.date.now("YYYY-MM-DD",  1, tp.file.title, "YYYY-MM-DD")
%>
## Overdue

```tasks
preset daily_note_overdue
```

## Do today

```tasks
preset daily_note_do_this_day
```

## Done today

```tasks
preset daily_note_done_this_day
```
