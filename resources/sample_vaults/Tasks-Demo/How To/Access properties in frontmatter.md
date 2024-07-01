# Access properties in frontmatter

## Accessing a custom property

```tasks
folder includes Test Data
group by function \
    const prop = task.file.frontMatter.custom_number_prop; \
    return prop ? prop : 'not set'
```

## Accessing tags

```tasks
folder includes Test Data
group by function \
    const prop = task.file.frontMatter.tags; \
    return prop ? prop : ''
```
