---
TQ_extra_instructions: |-
  limit 1
  hide toolbar
  ignore global query
TQ_explain: false
---

# Smoke test JS setting - should fail when disabled

See also [[Smoke test JS setting - should work when disabled]].

## Sample task

- [ ] #task hello

## Simple searches

### path includes {{query.file.path.toUpperCase()}}

```tasks
path includes {{query.file.path.toUpperCase()}}
```

### path includes {{4 + 6}}

```tasks
path includes {{4 + 6}}
```

## Accessing task properties

### sort by function task.lineNumber

```tasks
sort by function task.lineNumber
```

### group by function task.file.path

```tasks
group by function task.file.path
```

### group by function task.file.path.toUpperCase()

```tasks
group by function task.file.path.toUpperCase()
```

### group by function on task status values

```tasks
group by function task.status.name
group by function task.status.symbol
group by function task.status.nextSymbol
group by function task.status.type
```

## Other examples

### Hard-coded filter result

```tasks
filter by function true
```

## Presets

### preset this_folder_only

```tasks
preset this_folder_only
```

### {{preset.this_folder_only}}

```tasks
{{preset.this_folder_only}}
```
