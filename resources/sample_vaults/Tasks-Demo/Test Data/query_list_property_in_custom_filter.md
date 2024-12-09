---
root_dirs_to_search:
  - Formats/
  - Filters/
---

# query_list_property_in_custom_filter

- [ ] #task Task in 'query_list_property_in_custom_filter'

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
