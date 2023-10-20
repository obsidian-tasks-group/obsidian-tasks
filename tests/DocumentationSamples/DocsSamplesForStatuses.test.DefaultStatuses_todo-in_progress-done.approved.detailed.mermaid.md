
```mermaid
flowchart LR
1["'Todo'<br>[ ] -> [/]<br>(TODO)"]
2["'In Progress'<br>[/] -> [x]<br>(IN_PROGRESS)"]
3["'Done'<br>[x] -> [ ]<br>(DONE)"]
1 --> 2
2 --> 3
3 --> 1
```
