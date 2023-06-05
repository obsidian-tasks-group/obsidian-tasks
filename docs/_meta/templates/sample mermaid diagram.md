```mermaid
flowchart LR
1[Input Data]
2[Updated Code]
3{Output the same?}
1 --> 2
2 --> 3

4[Pass]
3---|Yes|4
linkStyle 2 stroke:green

5[Fail]
6[Open diff tool to show changes]
3---|No|5
5 --> 6

linkStyle 3 stroke:red
```
