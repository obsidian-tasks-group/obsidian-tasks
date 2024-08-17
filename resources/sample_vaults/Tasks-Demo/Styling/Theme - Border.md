# Theme - Border

<https://github.com/Akifyss/obsidian-border>

<!-- placeholder to force blank line before included text --><!-- include: DocsSamplesForStatuses.test.Theme_Border_Tasks.approved.md -->

- [ ] #task `space` To Do
- [/] #task `/` In Progress
- [x] #task `x` Done
- [-] #task `-` Cancelled
- [>] #task `>` Rescheduled
- [<] #task `<` Scheduled
- [!] #task `!` Important
- [?] #task `?` Question
- [i] #task `i` Infomation
- [S] #task `S` Amount
- [*] #task `*` Star
- [b] #task `b` Bookmark
- [“] #task `“` Quote
- [n] #task `n` Note
- [l] #task `l` Location
- [I] #task `I` Idea
- [p] #task `p` Pro
- [c] #task `c` Con
- [u] #task `u` Up
- [d] #task `d` Down

<!-- placeholder to force blank line after included text --><!-- endInclude -->

## Status grouped by status.type

```tasks
# We need to ignore the global query, as it ignores this file:
ignore global query

path includes {{query.file.path}}
group by status.type
sort by description
```
