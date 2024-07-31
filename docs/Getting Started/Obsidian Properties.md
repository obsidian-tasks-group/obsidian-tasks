---
publish: true
---

# Obsidian Properties

> [!warning]
> This page describes a **highly advanced** and **experimental** feature of the Tasks plugin, in order to get feedback from early adopters.
>
> The facilities are likely to change before final release, and your queries will probably need updating later on.

> [!released]
> Use of Obsidian Properties was introduced in Tasks X.Y.Z.

## What are Obsidian Properties

Obsidian offers a facility called [Properties](https://help.obsidian.md/Editing+and+formatting/Properties).

The Obsidian documentation says:

> [!Quote]
> Properties allow you to organize information about a note. Properties contain structured data such as text, links, dates, checkboxes, and numbers. Properties can also be used in combination with [Community plugins](https://help.obsidian.md/Extending+Obsidian/Community+plugins) that can do useful things with your structured data.

## What do you need to know?

- `TAG` and `TAGS` are standardised to `tags`
- `#` prefix is added to all tag values in frontmatter
- `ALIAS` and `ALIASES` are not standardised yet
- A value of `null` means that the property key was present in the file, but there was no value.
- A value of `undefined` means you tried accessing a property key that was not present in the frontmatter.
- Currently, in custom filters, sorts and groupings, a slightly standardised version of the frontmatter is available via:

| What                    | Meaning                                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `task.file.frontmatter` | Accesses a slightly sanitised/standardised version of the frontmatter/properties in the file containing the task |
|                         |                                                                                                                  |

## Examples

### Filtering examples

<!-- placeholder to force blank line before included text --><!-- include: CustomFilteringExamples.test.obsidian_properties_task.file.frontmatter_docs.approved.md -->

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

<!-- placeholder to force blank line after included text --><!-- endInclude -->

### Grouping examples

<!-- placeholder to force blank line before included text --><!-- include: CustomGroupingExamples.test.obsidian_properties_task.file.frontmatter_docs.approved.md -->

```javascript
group by function task.file.property('creation date') ?? 'no creation date'
```

- group tasks by 'creation date' date property.

```javascript
group by function \
    const value = task.file.property('creation date'); \
    return value ? window.moment(value).format('MMMM') : 'no month'
```

- group tasks by month in 'creation date' date property.

## Limitations

- It is not yet possible to use properties in the query file
