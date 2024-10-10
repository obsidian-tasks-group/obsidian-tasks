# Parent-Child relationships - Searches - Dataview

## 1 Simple lists

## 2 Filtering

### 2.1 Completed

```dataview
TASK
FROM "Other Plugins/Dataview/Parent-Child relationships - Tasks"
WHERE completed
```

### 2.2 Fully completed

```dataview
TASK
FROM "Other Plugins/Dataview/Parent-Child relationships - Tasks"
WHERE fullyCompleted
```

### 2.3 Not completed

```dataview
TASK
FROM "Other Plugins/Dataview/Parent-Child relationships - Tasks"
WHERE !completed
```

### 2.4 Not fully completed

```dataview
TASK
FROM "Other Plugins/Dataview/Parent-Child relationships - Tasks"
WHERE !fullyCompleted
```

## 3 Sorting

## 4 Grouping

### 4.1 Completed

```dataview
TASK
FROM "Other Plugins/Dataview/Parent-Child relationships - Tasks"
WHERE completed
GROUP BY meta(section).subpath
```

### 4.2 Fully completed

```dataview
TASK
FROM "Other Plugins/Dataview/Parent-Child relationships - Tasks"
WHERE fullyCompleted
GROUP BY meta(section).subpath
```

### 4.3 Not completed

```dataview
TASK
FROM "Other Plugins/Dataview/Parent-Child relationships - Tasks"
WHERE !completed
GROUP BY meta(section).subpath
```

### 4.4 Not fully completed

```dataview
TASK
FROM "Other Plugins/Dataview/Parent-Child relationships - Tasks"
WHERE !fullyCompleted
GROUP BY meta(section).subpath
```
