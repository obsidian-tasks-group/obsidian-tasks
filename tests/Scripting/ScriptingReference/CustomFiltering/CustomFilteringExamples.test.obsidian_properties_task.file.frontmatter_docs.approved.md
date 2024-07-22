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


<!-- placeholder to force blank line after included text -->
