---
root_dirs_to_search:
  - Formats/
  - Filters/
task_instruction: group by filename
task_instructions: |
  group by root
  group by folder
  group by filename
---

# query_using_properties

- [ ] #task Task in 'query_using_properties'

## Use a one-line property: task_instruction

Read a Tasks instruction from a property in this file, and embed it in to any number of queries in the file:

```tasks
explain
ignore global query
{{query.file.property('task_instruction')}}
limit 10
```

## Use a multi-line property: task_instructions

This fails as the `task_instructions` contains multiple lines , and placeholders are applied after the query is split at line-endings...

```tasks
ignore global query
folder includes Test Data
explain
{{query.file.property('task_instructions')}}
```

## Use a list property in a custom filter: root_dirs_to_search

```tasks
ignore global query
explain

filter by function \
    if (!query.file.hasProperty('root_dirs_to_search')) { \
        throw Error('Please set the "root_dirs_to_search" list property, with each value ending in a backslash...'); \
    } \
    const roots = query.file.property('root_dirs_to_search'); \
    return roots.includes(task.file.root);

limit groups 5
group by root
```
