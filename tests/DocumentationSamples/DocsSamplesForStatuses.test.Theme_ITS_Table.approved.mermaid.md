
```mermaid
flowchart LR

classDef TODO        stroke:#f33,stroke-width:3px;
classDef DONE        stroke:#0c0,stroke-width:3px;
classDef IN_PROGRESS stroke:#fa0,stroke-width:3px;
classDef CANCELLED   stroke:#ddd,stroke-width:3px;
classDef NON_TASK    stroke:#99e,stroke-width:3px;
classDef ON_HOLD     stroke:#00f,stroke-width:3px;

1["Unchecked"]:::TODO
2["Regular"]:::DONE
3["Checked"]:::DONE
4["Dropped"]:::CANCELLED
5["Forward"]:::TODO
6["Migrated"]:::TODO
7["Date"]:::TODO
8["Question"]:::TODO
9["Half Done"]:::IN_PROGRESS
10["Add"]:::TODO
11["Research"]:::TODO
12["Important"]:::TODO
13["Idea"]:::TODO
14["Brainstorm"]:::TODO
15["Pro"]:::TODO
16["Con"]:::TODO
17["Quote"]:::TODO
18["Note"]:::TODO
19["Bookmark"]:::TODO
20["Information"]:::TODO
21["Paraphrase"]:::TODO
22["Location"]:::TODO
23["Example"]:::TODO
24["Answer"]:::TODO
25["Reward"]:::TODO
26["Choice"]:::TODO
27["Doing"]:::IN_PROGRESS
28["Time"]:::TODO
29["Character / Person"]:::TODO
30["Talk"]:::TODO
31["Outline / Plot"]:::TODO
32["Conflict"]:::TODO
33["World"]:::TODO
34["Clue / Find"]:::TODO
35["Foreshadow"]:::TODO
36["Favorite / Health"]:::TODO
37["Symbolism"]:::TODO
38["Secret"]:::TODO
1 --> 2
2 --> 1
3 --> 1
4 --> 1
5 --> 2
6 --> 2
7 --> 2
8 --> 2
9 --> 2
10 --> 2
11 --> 2
12 --> 2
13 --> 2
14 --> 2
15 --> 2
16 --> 2
17 --> 2
18 --> 2
19 --> 2
20 --> 2
21 --> 2
22 --> 2
23 --> 2
24 --> 2
25 --> 2
26 --> 2
27 --> 2
28 --> 2
29 --> 2
30 --> 2
31 --> 2
32 --> 2
33 --> 2
34 --> 2
35 --> 2
36 --> 2
37 --> 2
38 --> 2

linkStyle default stroke:gray
```
