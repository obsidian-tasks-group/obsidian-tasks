# Theme - LYT Mode

<https://github.com/nickmilo/LYT-Mode>

<https://github.com/nickmilo/LYT-Mode#alternative-checkboxes>

Only supports Dark mode.

<!-- placeholder to force blank line before included text --><!-- include: DocsSamplesForStatuses.test.Theme_LYT_Mode_Tasks.approved.md -->

- [ ] #task `space` Unchecked
- [x] #task `x` Checked
- [>] #task `>` Rescheduled
- [<] #task `<` Scheduled
- [!] #task `!` Important
- [-] #task `-` Cancelled
- [/] #task `/` In Progress
- [?] #task `?` Question
- [*] #task `*` Star
- [n] #task `n` Note
- [l] #task `l` Location
- [i] #task `i` Information
- [I] #task `I` Idea
- [S] #task `S` Amount
- [p] #task `p` Pro
- [c] #task `c` Con
- [b] #task `b` Bookmark
- [f] #task `f` Fire
- [k] #task `k` Key
- [w] #task `w` Win
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
