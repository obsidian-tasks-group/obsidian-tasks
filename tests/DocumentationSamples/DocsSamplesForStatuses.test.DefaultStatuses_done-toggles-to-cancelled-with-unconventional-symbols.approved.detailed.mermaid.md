
```mermaid
flowchart LR
1["[ ] -> [*] 'Todo' (TODO)"]
2["[*] -> [x] 'Done' (DONE)"]
3["[x] -> [ ] 'Cancelled' (CANCELLED)"]
1 --> 2
2 --> 3
3 --> 1
```
