# Theme - Minimal Theme

<https://github.com/kepano/obsidian-minimal>

Available checkbox icons: <https://minimal.guide/Block+types/Checklists>

<!-- placeholder to force blank line before included text --><!-- include: DocsSamplesForStatuses.test.Theme_Minimal_Tasks.approved.md -->

- [ ] #task `space` to-do
- [/] #task `/` incomplete
- [x] #task `x` done
- [-] #task `-` canceled
- [>] #task `>` forwarded
- [<] #task `<` scheduling
- [?] #task `?` question
- [!] #task `!` important
- [*] #task `*` star
- ["] #task `"` quote
- [l] #task `l` location
- [b] #task `b` bookmark
- [i] #task `i` information
- [S] #task `S` savings
- [I] #task `I` idea
- [p] #task `p` pros
- [c] #task `c` cons
- [f] #task `f` fire
- [k] #task `k` key
- [w] #task `w` win
- [u] #task `u` up
- [d] #task `d` down

<!-- placeholder to force blank line after included text --><!-- endInclude -->

## Status grouped by status.type

```tasks
# We need to ignore the global query, as it ignores this file:
ignore global query

path includes {{query.file.path}}
group by status.type
sort by description
```
