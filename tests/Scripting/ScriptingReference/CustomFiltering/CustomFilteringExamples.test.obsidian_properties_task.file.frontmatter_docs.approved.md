<!-- placeholder to force blank line before included text -->


```javascript
filter by function task.file.frontmatter['kanban-plugin'] === 'basic'
```

- todo.

```javascript
filter by function task.file.frontmatter['kanban-plugin'] !== undefined
```

- todo.

```javascript
filter by function task.file.frontmatter['sample_list_property'] !== undefined
```

- find tasks in files where the list property 'sample_list_property' exists regardless of the value.

```javascript
filter by function task.file.frontmatter.sample_list_property !== undefined
```

- find tasks in files where the list property 'sample_list_property' exists regardless of the value.

```javascript
filter by function task.file.frontmatter.sample_list_property?.length > 0
```

- find tasks in files where the list property 'sample_list_property' exists and has at least one list item.

```javascript
filter by function task.file.frontmatter.sample_list_property?.length === 0
```

- find tasks in files where the list property 'sample_list_property' exists and has no list items.

```javascript
filter by function task.file.frontmatter['creation date']?.includes('2024') ?? false
```

- find tasks in files where the date property 'creation date' includes string '2024'.


<!-- placeholder to force blank line after included text -->
