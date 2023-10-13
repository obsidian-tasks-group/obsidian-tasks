# <% tp.file.title %>

<%*
  let yesterday = tp.date.now("YYYY-MM-DD", -1, tp.file.title, "YYYY-MM-DD")
  let today     = tp.date.now("YYYY-MM-DD",  0, tp.file.title, "YYYY-MM-DD")
  let tomorrow  = tp.date.now("YYYY-MM-DD",  1, tp.file.title, "YYYY-MM-DD")
%>

## Overdue

```tasks
not done
happens before <% today %>
```

## Do today

```tasks
not done
happens <% today %>
```
