# Theme - Ebullientworks

<https://github.com/ebullient/obsidian-theme-ebullientworks>

<!-- placeholder to force blank line before included text --><!-- include: DocsSamplesForStatuses.test.Theme_Ebullientworks_Tasks.approved.md -->

- [ ] #task `space` Unchecked
- [x] #task `x` Checked
- [-] #task `-` Cancelled
- [/] #task `/` In Progress
- [>] #task `>` Deferred
- [!] #task `!` Important
- [?] #task `?` Question
- [r] #task `r` Review

<!-- placeholder to force blank line after included text --><!-- endInclude -->

## Status grouped by status.type

```tasks
# We need to ignore the global query, as it ignores this file:
ignore global query

path includes {{query.file.path}}
group by status.type
sort by description
```
