
```mermaid
flowchart LR
1["[ ] -> [/] 'Todo' (TODO)"]
2["[/] -> [x] 'In Progress' (IN_PROGRESS)"]
3["[x] -> [ ] 'Done' (DONE)"]
1 --> 2
2 --> 3
3 --> 1
```
