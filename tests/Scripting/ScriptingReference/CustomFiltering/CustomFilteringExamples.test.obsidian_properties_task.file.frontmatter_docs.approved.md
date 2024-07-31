<!-- placeholder to force blank line before included text -->


```javascript
filter by function task.file.hasProperty('kanban-plugin')
```

- find tasks in [Kanban Plugin](https://github.com/mgmeyers/obsidian-kanban) boards.

```javascript
filter by function task.file.property("sample_list_property")?.length > 0
```

- find tasks in files where the list property 'sample_list_property' exists and has at least one list item.

```javascript
filter by function task.file.property("sample_list_property")?.length === 0
```

- find tasks in files where the list property 'sample_list_property' exists and has no list items.

```javascript
filter by function task.file.property('creation date')?.includes('2024') ?? false
```

- find tasks in files where the date property 'creation date' includes string '2024'.


<!-- placeholder to force blank line after included text -->
