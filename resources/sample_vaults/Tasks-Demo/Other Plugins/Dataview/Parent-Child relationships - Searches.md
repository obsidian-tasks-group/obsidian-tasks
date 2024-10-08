# Parent-Child relationships - Searches

*See [[Parent-Child relationships]].*

## 1 Completed

```dataview
TASK
FROM "Other Plugins/Dataview/Parent-Child relationships"
WHERE completed
GROUP BY meta(section).subpath
```

## 2 Fully completed

```dataview
TASK
FROM "Other Plugins/Dataview/Parent-Child relationships"
WHERE fullyCompleted
GROUP BY meta(section).subpath
```

## 3 Not completed

```dataview
TASK
FROM "Other Plugins/Dataview/Parent-Child relationships"
WHERE !completed
GROUP BY meta(section).subpath
```

## 4 Not fully completed

```dataview
TASK
FROM "Other Plugins/Dataview/Parent-Child relationships"
WHERE !fullyCompleted
GROUP BY meta(section).subpath
```
