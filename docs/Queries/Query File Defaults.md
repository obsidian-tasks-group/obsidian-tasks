---
publish: true
---

# Query File Defaults

## Summary

Scenarios:

- You have multiple Tasks queries in a Markdown file, and they have a lot of
  text in common. You would like to avoid repeating those common instructions in
  each one.
- Usually you like to see your Tasks search results with certain [[Layout]]
  options, but sometimes it is nice to see more detail, perhaps turning
  `show tree` on and off, depending on your mood.

## Example

## Recognised Properties

## Conveniences

### Set up your types.json file

These are all the types of properties currently supported by Tasks, as Query
File Defaults.

> [!tip]
> We plan to make Tasks add these types to the Obsidian vault automatically in
> future.

```json
{
  "types": {
    "tasks_query_explain": "checkbox",
    "tasks_query_short_mode": "checkbox",
    "tasks_query_show_tree": "checkbox",
    "tasks_query_show_tags": "checkbox",
    "tasks_query_show_id": "checkbox",
    "tasks_query_show_depends_on": "checkbox",
    "tasks_query_show_priority": "checkbox",
    "tasks_query_show_recurrence_rule": "checkbox",
    "tasks_query_show_on_completion": "checkbox",
    "tasks_query_show_created_date": "checkbox",
    "tasks_query_show_start_date": "checkbox",
    "tasks_query_show_scheduled_date": "checkbox",
    "tasks_query_show_due_date": "checkbox",
    "tasks_query_show_cancelled_date": "checkbox",
    "tasks_query_show_done_date": "checkbox",
    "tasks_query_show_urgency": "checkbox",
    "tasks_query_show_backlink": "checkbox",
    "tasks_query_show_edit_button": "checkbox",
    "tasks_query_show_postpone_button": "checkbox",
    "tasks_query_show_task_count": "checkbox",
    "tasks_query_extra_instructions": "text"
  }
}
```

### Paste in all supported property values

These are all the properties currently supported by Tasks, as Query File
Defaults.

You can paste these lines in the top of any file containing Tasks queries.

> [!tip]
> Make sure your don't add duplicate `---` lines to the file though: if the file
> already had properties, just copy the text between the `---` lines.

<!-- snippet: DocsSamplesForDefaults.test.DocsSamplesForDefaults_supported-properties-empty.approved.yaml -->
```yaml
---
tasks_query_explain:
tasks_query_short_mode:
tasks_query_show_tree:
tasks_query_show_tags:
tasks_query_show_id:
tasks_query_show_depends_on:
tasks_query_show_priority:
tasks_query_show_recurrence_rule:
tasks_query_show_on_completion:
tasks_query_show_created_date:
tasks_query_show_start_date:
tasks_query_show_scheduled_date:
tasks_query_show_due_date:
tasks_query_show_cancelled_date:
tasks_query_show_done_date:
tasks_query_show_urgency:
tasks_query_show_backlink:
tasks_query_show_edit_button:
tasks_query_show_postpone_button:
tasks_query_show_task_count:
tasks_query_extra_instructions:
---
```
<!-- endSnippet -->

> [!tip]
> We hope in the future to add an Obsidian Command to add all supported Query
> File Defaults properties to the current file automatically.

### Dynamic editing of options

> [!tip]
> We plan to share here how to use the MetaBind plugin to easily edit your Query
> File Defaults properties.

### Making the property names readable

The property names are

<!-- snippet: resources/sample_vaults/Tasks-Demo/.obsidian/snippets/widen-property-labels.css -->
```css
/* Make property labels wider, to fit the names of Tasks-specific properties */
.metadata-content {
    --metadata-label-width: 18em;
}
```
<!-- endSnippet -->
