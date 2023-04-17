# Dataview Format - Queries - Dataview Plugin

This file contains **dataview** queries, to demonstrate how dataview parses task data in files in this folder.

## 1 Due 2021-08-22 - according to dataview

```dataview
TASK
FROM "Manual Testing/Testing File Formats"
WHERE due = date("2021-08-22")
GROUP BY meta(section).subpath
```

## 2 NOT Due 2021-08-22 - according to dataview

```dataview
TASK
FROM "Manual Testing/Testing File Formats"
WHERE due != date("2021-08-22")
GROUP BY meta(section).subpath
```
