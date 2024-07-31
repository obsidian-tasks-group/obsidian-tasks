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

<!-- placeholder to force blank line after included text --><!-- endInclude -->

## yaml_complex_example

```yaml
---
TAG:
  - value1
  - value2
ALIAS:
  - test 1
  - test 2
custom_list:
  - value 1
  - value 2
custom_list_2:
  - x
custom_number_prop: 42
unknown_property:
  - hello
  - world
unknown_property_2:
  - 1
  - 2
unknown_number_property: 13
unknown_empty_property:
unknown_list:
  -
  -
parent:
  - child1:
    - grandchild1: 1
    - grandchild2: 2
  - child2:
    - grandchild3: 3
    - grandchild4: 4
---
```

 `task.file.frontmatter` will contain:

<!-- snippet: TasksFile.test.TasksFile_-_reading_frontmatter_should_read_yaml_complex_example.approved.json -->
```json
{
  "TAG": [
    "value1",
    "value2"
  ],
  "ALIAS": [
    "test 1",
    "test 2"
  ],
  "custom_list": [
    "value 1",
    "value 2"
  ],
  "custom_list_2": [
    "x"
  ],
  "custom_number_prop": 42,
  "unknown_property": [
    "hello",
    "world"
  ],
  "unknown_property_2": [
    1,
    2
  ],
  "unknown_number_property": 13,
  "unknown_empty_property": null,
  "unknown_list": [
    null,
    null
  ],
  "parent": [
    {
      "child1": [
        {
          "grandchild1": 1
        },
        {
          "grandchild2": 2
        }
      ]
    },
    {
      "child2": [
        {
          "grandchild3": 3
        },
        {
          "grandchild4": 4
        }
      ]
    }
  ],
  "tags": [
    "#value1",
    "#value2"
  ]
}
```
<!-- endSnippet -->

## complex_example_standardised

```yaml
---
tags:
  - value1
  - value2
aliases:
  - test 1
  - test 2
custom_list:
  - value 1
  - value 2
custom_list_2:
  - x
custom_number_prop: 42
unknown_property:
  - hello
  - world
unknown_property_2:
  - 1
  - 2
unknown_number_property: 13
unknown_empty_property:
unknown_list:
parent:
  - child1:
      - grandchild1: 1
      - grandchild2: 2
  - child2:
      - grandchild3: 3
      - grandchild4: 4
---
```

`task.file.frontmatter` will contain:

<!-- snippet: TasksFile.test.TasksFile_-_reading_frontmatter_should_read_yaml_complex_example_standardised.approved.json -->
```json
{
  "tags": [
    "#value1",
    "#value2"
  ],
  "aliases": [
    "test 1",
    "test 2"
  ],
  "custom_list": [
    "value 1",
    "value 2"
  ],
  "custom_list_2": [
    "x"
  ],
  "custom_number_prop": 42,
  "unknown_property": [
    "hello",
    "world"
  ],
  "unknown_property_2": [
    1,
    2
  ],
  "unknown_number_property": 13,
  "unknown_empty_property": null,
  "unknown_list": null,
  "parent": [
    {
      "child1": [
        {
          "grandchild1": 1
        },
        {
          "grandchild2": 2
        }
      ]
    },
    {
      "child2": [
        {
          "grandchild3": 3
        },
        {
          "grandchild4": 4
        }
      ]
    }
  ]
}
```
<!-- endSnippet -->

## yaml_all_property_types_populated

<!-- snippet: TasksFile.test.TasksFile_-_reading_frontmatter_should_read_yaml_all_property_types_populated.approved.json -->
```json
{
  "sample_checkbox_property": true,
  "sample_date_property": "2024-07-21",
  "sample_date_and_time_property": "2024-07-21T12:37:00",
  "sample_list_property": [
    "Sample",
    "List",
    "Value"
  ],
  "sample_number_property": 246,
  "sample_text_property": "Sample Text Value",
  "sample_link_property": "[[yaml_all_property_types_populated]]",
  "sample_link_list_property": [
    "[[yaml_all_property_types_populated]]",
    "[[yaml_all_property_types_empty]]"
  ],
  "aliases": [
    "YAML All Property Types Populated"
  ],
  "tags": [
    "#sample/tag/value"
  ],
  "creation date": "2024-05-25T15:17:00"
}
```
<!-- endSnippet -->

## yaml_all_property_types_empty

<!-- snippet: TasksFile.test.TasksFile_-_reading_frontmatter_should_read_yaml_all_property_types_empty.approved.json -->
```json
{
  "sample_checkbox_property": null,
  "sample_date_property": null,
  "sample_date_and_time_property": null,
  "sample_list_property": null,
  "sample_number_property": null,
  "sample_text_property": null,
  "sample_link_property": null,
  "sample_link_list_property": null,
  "aliases": null,
  "tags": [],
  "creation date": null
}
```
<!-- endSnippet -->

## Limitations

- It is not yet possible to use properties in the query file
