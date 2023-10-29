
# Review and check your Statuses

This file was created by the Obsidian Tasks plugin, to help visualise the
task statuses in this vault.

You can delete this file any time.

<!-- Switch to Live Preview or Reading Mode to see the diagram. -->


```mermaid
flowchart LR
1["'Todo'<br>[ ] -> [x]<br>(TODO)"]
2["'In Progress'<br>[/] -> [x]<br>(IN_PROGRESS)"]
3["'Done'<br>[x] -> [ ]<br>(DONE)"]
4["'Cancelled'<br>[-] -> [ ]<br>(CANCELLED)"]
5["'Question'<br>[Q] -> [A]<br>(NON_TASK)"]
6["'Answer'<br>[A] -> [Q]<br>(NON_TASK)"]
1 --> 3
2 --> 3
3 --> 1
4 --> 1
5 --> 6
6 --> 5
```

