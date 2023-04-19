# Dataview Format - Queries - Tasks Plugin

This file contains **Tasks** queries, to demonstrate how dataview parses task data in files in this folder.

## 1 Due 2021-08-22 - according to Tasks

```tasks
# explain
path includes Manual Testing/Testing File Formats
due on 2021-08-22

group by heading
hide backlink
```

## 2 NOT Due 2021-08-22 - according to Tasks

```tasks
# explain
path includes Manual Testing/Testing File Formats
NOT (due on 2021-08-22)

group by heading
hide backlink
```
