# Parent-Child relationships - Searches - Dataview

## 1 Simple lists

### 1.1 Original Order

```dataview
TASK
FROM "Other Plugins/Dataview/Parent-Child relationships - Tasks"
```

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

==TODO Sort by due date==

### 3.1 Original Order

```dataview
TASK
FROM "Other Plugins/Dataview/Parent-Child relationships - Tasks"
SORT line asc
```

### 3.2 Reverse Order

```dataview
TASK
FROM "Other Plugins/Dataview/Parent-Child relationships - Tasks"
SORT line desc
```

## 4 Grouping

==TODO Group by due date==

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
