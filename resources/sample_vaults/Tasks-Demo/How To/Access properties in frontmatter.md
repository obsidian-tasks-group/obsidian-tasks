# Access properties in frontmatter

> [!warning]
> Tasks does not currently sanitise tags from frontmatter, such as adding a  `#` prefix.
>
## Accessing a custom property

```tasks
folder includes Test Data
group by function task.file.frontmatter.custom_number_prop ?? 'not set'
```

## Accessing tags

```tasks
folder includes Test Data
group by function task.file.frontmatter.tags ?? ''
```
