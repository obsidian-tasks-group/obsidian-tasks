---
publish: true
---

# Obsidian Properties

> [!released]
> Use of Obsidian Properties was introduced in Tasks 7.7.0.

## What are Obsidian Properties?

Obsidian offers a facility called [Properties](https://help.obsidian.md/Editing+and+formatting/Properties).

Properties allow you to organize information about a note. Properties contain structured data such as text, links, dates, checkboxes, and numbers.

This is an example property section, and it *must* appear on the very first line of the markdown file:

```yaml
---
name: value
---
```

In the Tasks documentation, we refer to these as Obsidian Properties, to distinguish them from Task and Query properties.

Background reading on Obsidian Properties:

- [An Introduction to Obsidian Properties - Obsidian Rocks](https://obsidian.rocks/an-introduction-to-obsidian-properties/)
- [Obsidian "properties" to help sort your stuff - Mickey Mellen](https://www.mickmel.com/obsidian-properties-to-help-sort-your-stuff/)

## Why use Obsidian Properties in Tasks queries?

Only if it will save you time!

Many, if not most, Tasks searches do not need to use Obsidian Properties.

But you might want to put a piece of information in to a file's Obsidian Properties, rather than putting it on every task in the file.

For example, if you associate a tag with a project, you might want to put that tag in one place at the top of the file, instead of having to remember to add it on every single task line in the file.

## How does Tasks treat Obsidian Properties?

You might want to start with the [[#Obsidian Properties Query Examples|examples below]] for an idea of *what* Tasks can do with Obsidian Properties.

This section describes the *how*...

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
  - The `#` prefix is added to all tag values returned by this function.
- Aliases in Frontmatter are not yet standardised.
  - If your vault contains a mixture of `alias`, `ALIAS` and `ALIASES`,  your queries will need to be coded to handle both spellings, for now.
- Tasks reads both YAML and [JSON](https://help.obsidian.md/Editing+and+formatting/Properties#JSON+Properties) formats.

## Obsidian Properties Query Examples

### Tags

#### Show tasks from files with a specific tag in frontmatter

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

You can control how Tasks should treat tasks in [[Kanban Plugin]] files.

#### Only show tasks in Kanban plugin files

```javascript
filter by function task.file.hasProperty('kanban-plugin')
```

#### Don't show tasks in Kanban plugin files

```javascript
filter by function ! task.file.hasProperty('kanban-plugin')
```

### Tracking projects

#### Use a `project` property

Suppose you have multiple files associated with a project, spread throughout your vault, and they all have a `project` property like this:

```yaml
---
project: Project 1
---
```

This search will find all tasks in those files:

```javascript
filter by function task.file.property('project') === 'Project 1'
```

#### Use `#project/...` tag values

Some people prefer to use properties tags to identify projects. One advantage of tags is it is easy to add multiple values.

```yaml
---
tags:
  - project/project-1
---
```

This exact-match search will find all tasks in such files:

```javascript
filter by function task.file.property('tags').includes('#project/project-1')
```

If you wanted to use a sub-string search to find all tasks in files with any properties tag beginning `#project/` you could use [optional chaining (?.)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) and the [nullish coalescing operator (??)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) like this:

```javascript
filter by function task.file.property('tags')?.join(',').includes('#project/') ?? false
```

Or you could use [template literals (Template strings)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) like this:

```javascript
filter by function `${task.file.property('tags')}`.includes('#project/')
```

### Using date values

Obsidian supports [Date](https://help.obsidian.md/Editing+and+formatting/Properties#^date-time) and [Date & time](https://help.obsidian.md/Editing+and+formatting/Properties#^date-time) property values.

It stores them in the format shown in these examples:

```yaml
---
date: 2020-08-21
time: 2020-08-21T10:30:00
---
```

Currently, Tasks does nothing special with these, seeing them as string values.

#### Grouping by raw date values

A `creation date` property might be used like this, to group tasks by the date their file was created, according to the stored property values:

```javascript
group by function task.file.property('creation date') ?? 'no creation date'
```

#### Formatting date values using Moment.js

If you want to do date calculations on `Date` or `Date & time` values, you can use `window.moment(value)` to create a [Moment.js](https://momentjs.com) object.

For example:

```javascript
group by function \
    const value = task.file.property('creation date'); \
    return value ? window.moment(value).format('YYYY MMMM') : 'no date'
```

## How does Tasks interpret Obsidian Properties?

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

> [!tip]
> `query.file.hasProperty()` and `query.file.property()` are also available, and naturally behave the same.

## Using Query Properties in Searches

> [!released]
> Use of Obsidian properties in placeholders was introduced in Tasks 7.15.0.

- It is now possible to use properties in the query file:
  - `query.file.hasProperty()` works.
  - `query.file.property()` works.

Imagine this text at the top of **the note containing the query**:

```yaml
---
search-text: exercise
workdate: 2024-04-01
groupby: group by happens
---
```

It can be used in queries in several ways:

1. A search term from frontmatter embedded via placeholder:

    ```javascript
    description includes {{query.file.property('search-text')}}
    due on or before {{query.file.property('workdate')}}
    ```

    > [!warning]
    > You must make sure that the property values are set in the query file. Otherwise the text `null` is inserted, which is unlikely to be what you want.

2. An entire instruction controlled by front-matter value, embedded with a [[Placeholders|placeholder]]:

    ```javascript
    {{query.file.property('groupby') ?? ''}}
    ```

    The `?? ''` text ensures that if the property is not set, the instruction is ignored, instead of `null` being inserted.

> [!tip]
> See also [[Query File Defaults]] for built-in properties automatically supported by Tasks searches.

> [!warning] Using properties with no value
> Currently when a property in a placeholder is *not* set:
>
> - in text instructions, the string used is currently `null`, which is not likely to be the intent
> - in numeric instructions, the value used is `null` which gives an error
