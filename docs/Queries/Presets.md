---
publish: true
---

# Presets

## What are Presets?

Presets allow you to save commonly used task query instructions and reuse them across multiple queries. Instead of repeatedly typing the same complex filters and sorting options, you can define them once in settings and reference them by name.

> [!released]
> Introduced in Tasks X.Y.Z.

## Why Use Presets?

Presets are particularly useful when you:

- Use the same query patterns frequently
- Want to maintain consistent formatting across multiple task views
- Need to update search criteria in multiple locations (change once, update everywhere)
- Use daily notes with recurring task queries

## How to Define Presets

1. Open Tasks settings
2. Navigate to the "Presets" section
3. Add your preset definitions using the format:
   - **Name**: A simple identifier (e.g., `my_overdue_tasks`)
   - **Instructions**: One or more valid task query lines

## How to Use Presets

There are two ways to use presets in your task queries:

### Basic Usage

```text
preset preset_name
```

For example:

```text
preset my_overdue_tasks
```

### Placeholder Usage

```text
{{preset.preset_name}}
```

For example:

```text
{{preset.my_overdue_tasks}}
```

### When to Use Each Method

Use the **basic syntax** (`preset name`) for most cases where you want to include complete instruction lines.

Use the **placeholder syntax** (`{{preset.name}}`) when you need to:

- Include presets within Boolean query combinations (AND, OR, NOT)
- Define partial instruction lines, such as expressions for `filter by function`, `sort by function`, or `group by function`

## Default Presets

Tasks includes several built-in presets:

- `this_file` - Tasks from the current file only
- `this_folder` - Tasks from the current folder
- `hide_date_fields` - Hide all date-related fields
- `hide_non_date_fields` - Hide priority, dependencies, etc.
- `hide_everything` - Show only task descriptions and tags

## Example: Daily Note Presets

A common use case is creating presets for daily notes.

The following presets work when the daily note's file name matches the pattern `YYYY-MM-DD`.

**Preset name**: `overdue_tasks`
**Instructions**:

```text
not done
happens before {{query.file.filenameWithoutExtension}}
group by function task.happens.format('YYYY-MM')
```

Then use in your daily note:

````text
```tasks
preset overdue_tasks
```
````

**Preset name**: `today_tasks`
**Instructions**:

```text
not done
happens {{query.file.filenameWithoutExtension}}
```

Then use in your daily note:

````text
```tasks
preset today_tasks
```
````

## Advanced Usage

### Boolean Combinations

The placeholder syntax allows presets to be used within Boolean query combinations:

```text
({{preset.work_tasks}}) AND ({{preset.high_priority}})
```

### Partial Instructions

You can create presets that define partial instruction lines for use with function-based queries:

**Preset name**: `filter_home_context`
**Instructions**:

```text
task.tags.find(tag => tag.includes('#context/home'))
```

**Usage**:

```text
filter by function {{preset.filter_home_context}}
```

This approach is particularly useful for complex filter expressions that you want to reuse across multiple queries.

## Limitations

- Preset names should not contain spaces or special characters
- When using basic syntax (`preset name`), presets must contain complete, valid instruction lines
- When using placeholder syntax (`{{preset.name}}`), presets can contain partial instruction lines
- Presets are applied exactly as written and cannot be modified when used
- The basic syntax (`preset name`) cannot be used within Boolean query combinations
