---
publish: true
---

# Frontmatter Properties

> [!released]
> Use of Frontmatter Properties was introduced in Tasks X.Y.Z.

> [!warning]
> The current implementation of Tasks does not re-read task lines if their file's frontmatter changes.
>
> So for now, if you edit frontmatter values, you will need to do one of:
>
> 1. Make an edit to any task line in the file, which causes the whole file to be reread
> 2. Run the `Reload app without saving` command
> 3. Restart Obsidian.

## What are Frontmatter Properties

Obsidian offers a facility called [Properties](https://help.obsidian.md/Editing+and+formatting/Properties).

The Obsidian documentation says:

> [!Quote]
> Properties allow you to organize information about a note. Properties contain structured data such as text, links, dates, checkboxes, and numbers. Properties can also be used in combination with [Community plugins](https://help.obsidian.md/Extending+Obsidian/Community+plugins) that can do useful things with your structured data.

This is an example property section, and it *must* appear on the very first line of the markdown file:

```yaml
---
name: value
---
```

In the Tasks documentation, we refer to these as Frontmatter Properties, to distinguish them from Task and Query properties.

## How does Tasks treat Frontmatter Properties?

- Frontmatter property values can be used in  the following instructions:
  - `filter by function`
  - `sort by function`
  - `group by function`
- `task.file.hasProperty('property name')` returns `true` if:
  - The task is in a file that has a property called `property name`
  - And that property has a non-empty value.
- `task.file.property('property name')` returns:
  - The property's value
  - Or `null` if:
    - the property has no value,
    - or the task's file does not contain that property.
  - Property names are case-insensitive:
    - `property name` will find `Property Name`, for example.
- Tags in Frontmatter can be accessed with `task.file.property('tags')`
  - `TAG` and `TAGS` are standardised to `tags`.
  - The `#` prefix is added to all tag values in frontmatter.
- Aliases in Frontmatter are not yet standardised.
  - If your vault contains a mixture of `alias`, `ALIAS` and `ALIASES`,  your queries will need to be coded to handle both spellings, for now.
- Tasks reads both YAML and [JSON](https://help.obsidian.md/Editing+and+formatting/Properties#JSON+Properties) properties.

## Frontmatter Properties Examples

### Tags

#### Show files from tasks with a specific tag in frontmatter

```javascript
filter by function task.file.property('tags').includes('#sample-tag')
```

Note that this is an exact tag search. It will not match `#sample-tag/some-sub-tag`.

#### Do not show any tasks from files with a specific tag in frontmatter

```javascript
filter by function ! task.file.property('tags').includes('#notasks')
```

If you wanted to adopt such a convention throughout all your Tasks queries, you could add the above to your [[Global Query]].

### Kanban plugin

#### Only show tasks in Kanban plugin files

```javascript
filter by function task.file.hasProperty('kanban-plugin')
```

#### Don't show tasks in Kanban plugin files

```javascript
filter by function ! task.file.hasProperty('kanban-plugin')
```

### More filtering examples

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

### More grouping examples

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

## How does Tasks interpret Frontmatter Properties?

Consider a file with the following example properties (or "Frontmatter"):

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

The following table shows how most of those properties are interpreted in Tasks queries:

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

## Limitations

- It is not yet possible to use properties in the query file:
  - `query.file.hasProperty()` does not yet work.
  - `query.file.property()` does not yet work.
