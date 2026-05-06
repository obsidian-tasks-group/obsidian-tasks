---
TQ_extra_instructions: |-
  limit 1
  hide toolbar
  ignore global query
TQ_explain: false
---

# Smoke test JS setting - should work when disabled

See also [[Smoke test JS setting - should fail when disabled]].

## Sample task

- [ ] #task hello

## Simple searches

### Simple path search

```tasks
path includes Test Data
```

### Simple path search with continuation line

```tasks
path includes \
    Test Data
```

## Accessing task properties

### group by task status values

```tasks
group by status.name
group by status.type
```

## Placeholders in filters

### path includes {{query.file.path}}

```tasks
path includes {{query.file.path}}
```

## Presets

### preset path_includes_test_data

```tasks
preset path_includes_test_data
```

### {{preset.path_includes_test_data}}

```tasks
{{preset.path_includes_test_data}}
```
