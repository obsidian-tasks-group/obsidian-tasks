---
TQ_extra_instructions: |-
  not done
  # show tree
  # limit 200
  limit groups 10
  # filter by function task.children.length > 0
  # filename includes acme
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

