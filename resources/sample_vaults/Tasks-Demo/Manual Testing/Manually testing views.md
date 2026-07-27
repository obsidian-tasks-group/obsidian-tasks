---
TQ_extra_instructions: |-
  show tree
  limit 5
  limit groups 1
  filter by function task.children.length > 0
level_1_group: priority
---
# Manually testing views

## Column view

```tasks
view columns by {{query.file.property('level_1_group')}}
```

## List view

```tasks
view list
group by {{query.file.property('level_1_group')}}
```

