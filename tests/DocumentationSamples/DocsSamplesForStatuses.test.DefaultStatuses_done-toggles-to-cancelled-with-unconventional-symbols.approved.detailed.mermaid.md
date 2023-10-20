
```mermaid
flowchart LR
1["'Todo'<br>[ ] -> [*]<br>(TODO)"]
2["'Done'<br>[*] -> [x]<br>(DONE)"]
3["'Cancelled'<br>[x] -> [ ]<br>(CANCELLED)"]
1 --> 2
2 --> 3
3 --> 1
```
