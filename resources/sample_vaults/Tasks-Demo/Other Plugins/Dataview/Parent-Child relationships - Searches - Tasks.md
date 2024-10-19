# Parent-Child relationships - Searches - Tasks

## 1 Simple lists

### 1.1 Original Order

```tasks
folder includes {{query.file.folder}}
sort by function task.lineNumber
hide backlinks
show tree
```

Note: Tasks uses the due date in its default sort order,<br>so we override that by sorting by line number.

## 2 Filtering

### 2.1 Completed

```tasks
folder includes {{query.file.folder}}
done
hide backlinks
show tree
```

### 2.2 Fully completed

==Not Implemented==

```tasks
folder includes {{query.file.folder}}
# There is no Tasks instruction for "fully done" yet
done
hide backlinks
show tree
```

### 2.3 Not completed

```tasks
folder includes {{query.file.folder}}
not done
hide backlinks
show tree
```

### 2.4 Not fully completed

==Not Implemented==

```tasks
folder includes {{query.file.folder}}
# There is no Tasks instruction for "not fully done" yet
not done
hide backlinks
show tree
```

## 3 Sorting

==TODO Sort by due date==

### 3.1 Original Order

```tasks
folder includes {{query.file.folder}}
sort by function task.lineNumber
hide backlinks
show tree
```

### 3.2 Reverse Order

```tasks
folder includes {{query.file.folder}}
sort by function reverse task.lineNumber
hide backlinks
show tree
```

## 4 Grouping

==TODO Group by due date==

### 4.1 Completed

```tasks
folder includes {{query.file.folder}}
done
group by heading
hide backlinks
show tree
```

### 4.2 Fully completed

==Not Implemented==

```tasks
folder includes {{query.file.folder}}
# There is no Tasks instruction for "fully done" yet
done
group by heading
hide backlinks
show tree
```

### 4.3 Not completed

```tasks
folder includes {{query.file.folder}}
not done
group by heading
hide backlinks
show tree
```

### 4.4 Not fully completed

==Not Implemented==

```tasks
folder includes {{query.file.folder}}
# There is no Tasks instruction for "not fully done" yet
not done
group by heading
hide backlinks
show tree
```
