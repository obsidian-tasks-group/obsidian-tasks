
```mermaid
flowchart LR
1[Unchecked]
2[Checked]
3[Cancelled]
4[In Progress]
5[Deferred]
6[Important]
7[Question]
8[Review]
1 --> 2
2 --> 1
3 --> 1
4 --> 2
5 --> 2
6 --> 2
7 --> 2
8 --> 2
```
