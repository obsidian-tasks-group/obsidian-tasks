# Access properties in frontmatter

These examples work with Tasks 7.7.0 and later.

## Accessing a custom property for grouping

Group by property `custom_number_prop`, with tasks from files without that property being un-grouped:

```tasks
folder includes Test Data
group by function task.file.property('custom_number_prop')

limit groups 5
```

Group by property `custom_number_prop`, with a fixed gorup name for tasks from files without that property:

```tasks
folder includes Test Data
group by function task.file.property('custom_number_prop') ?? 'no "custom_number_prop" value'

limit groups 5
```

## Accessing tags

Group by each tag property value, and tasks with more than one tag are listed multiple times:

```tasks
folder includes Test Data
group by function task.file.property('tags')

limit groups 5
```

Group by tag property values, and tasks with more than one tag are listed only once

```tasks
folder includes Test Data
group by function task.file.property('tags').sort().join(', ')

limit groups 5
```
