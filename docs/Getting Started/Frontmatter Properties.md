---
publish: true
---

# Frontmatter Properties

> [!warning]
> This page describes a **highly advanced** and **experimental** feature of the Tasks plugin, in order to get feedback from early adopters.
>
> The facilities are likely to change before final release, and your queries will probably need updating later on.

> [!released]
> Use of Obsidian Properties was introduced in Tasks X.Y.Z.

## What are Frontmatter Properties

Obsidian offers a facility called [Properties](https://help.obsidian.md/Editing+and+formatting/Properties).

The Obsidian documentation says:

> [!Quote]
> Properties allow you to organize information about a note. Properties contain structured data such as text, links, dates, checkboxes, and numbers. Properties can also be used in combination with [Community plugins](https://help.obsidian.md/Extending+Obsidian/Community+plugins) that can do useful things with your structured data.

In the Tasks documentation, we refer to these as Frontmatter Properties, to distinguish them from Task and Query properties.

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

## How does Tasks interpret Obsidian Properties?

Consider a file with the following example properties:

<!-- TODO this was copied from docs_sample_for_task_properties_reference.md - embed the content automatically in future... -->

```yaml
---
sample_checkbox_property: true
sample_date_property: 2024-07-21
sample_date_and_time_property: 2024-07-21T12:37:00
sample_list_property:
  - Sample
  - List
  - Value
sample_number_property: 246
sample_text_property: Sample Text Value
sample_text_multiline_property: |
  Sample
  Text
  Value
sample_link_property: "[[yaml_all_property_types_populated]]"
sample_link_list_property:
  - "[[yaml_all_property_types_populated]]"
  - "[[yaml_all_property_types_empty]]"
aliases:
  - YAML All Property Types Populated
tags:
  - tag-from-file-properties
creation date: 2024-05-25T15:17:00
project: Secret Project
---
```

The following table shows how some of those properties are interpreted by Tasks:

<!-- placeholder to force blank line before included text --><!-- include: TaskProperties.test.task_frontmatter_properties.approved.md -->

| Field | Type 1 | Example 1 |
| ----- | ----- | ----- |
| `task.file.hasProperty('creation date')` | `boolean` | `true` |
| `task.file.property('creation date')` | `string` | `'2024-05-25T15:17:00'` |
| `task.file.property('sample_checkbox_property')` | `boolean` | `true` |
| `task.file.property('sample_date_property')` | `string` | `'2024-07-21'` |
| `task.file.property('sample_date_and_time_property')` | `string` | `'2024-07-21T12:37:00'` |
| `task.file.property('sample_list_property')` | `string[]` | `['Sample', 'List', 'Value']` |
| `task.file.property('sample_number_property')` | `number` | `246` |
| `task.file.property('sample_text_property')` | `string` | `'Sample Text Value'` |
| `task.file.property('sample_text_multiline_property')` | `string` | `'Sample\nText\nValue\n'` |
| `task.file.property('sample_link_property')` | `string` | `'[[yaml_all_property_types_populated]]'` |
| `task.file.property('sample_link_list_property')` | `string[]` | `['[[yaml_all_property_types_populated]]', '[[yaml_all_property_types_empty]]']` |
| `task.file.property('tags')` | `string[]` | `['#tag-from-file-properties']` |

<!-- placeholder to force blank line after included text --><!-- endInclude -->

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

<!-- placeholder to force blank line after included text --><!-- endInclude -->

## Limitations

- It is not yet possible to use properties in the query file
