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

### Obsidian-native User Interface

You can use the Obsidian **File properties** view to customise Tasks searches:

![Obsidian's 'File properties' widget, with checkboxes and a text box to modify query file defaults for a file containing Tasks searches.](../images/query-file-defaults-file-properties-controls.png)
<span class="caption">Obsidian's **File properties** widget, with checkboxes and a text box to modify query file defaults for a file containing Tasks searches. See [[#Making the property names readable]] for the CSS snippet used to widen property names.</span>

To try this out:

1. Enable the Obsidian core Properties view plugin.
2. Switch to Reading or Live Preview modes.
3. Run the Properties view: Show file properties command.
4. Modify queries simply by editing file properties with names beginning `tasks_query_`.

### Creating a User Interface for the defaults

You can use the [Meta Bind](https://obsidian.md/plugins?search=Meta%20Bind) plugin to create a User Interface to easily change your Tasks searches:

![Meta Bind widgets to edit Query File Defaults](../images/query-file-defaults-meta-bind-controls.png)
<span class="caption">Meta Bind widgets to edit Query File Defaults</span>

Steps to do this, which assume you have already [turned off Obsidian's Restricted mode](https://help.obsidian.md/Extending+Obsidian/Plugin+security):

1. Install and enable [Meta Bind](https://obsidian.md/plugins?search=Meta%20Bind)
2. Click the Copy button to copy the Markdown below.
3. Paste the markdown in to a note in Obsidian that has one or more Tasks searches.
4. Switch to Live Preview or Reading modes, to see the widgets.
5. After experimenting, delete any labels and widgets that you do not need.

<!-- snippet: DocsSamplesForDefaults.test.DocsSamplesForDefaults_meta-bind-widgets-snippet.approved.md -->
```md
short mode: `INPUT[toggle:tasks_query_short_mode]`
tree: `INPUT[toggle:tasks_query_show_tree]`
tags: `INPUT[toggle:tasks_query_show_tags]`
id: `INPUT[toggle:tasks_query_show_id]` depends on: `INPUT[toggle:tasks_query_show_depends_on]`
priority: `INPUT[toggle:tasks_query_show_priority]`
recurrence rule: `INPUT[toggle:tasks_query_show_recurrence_rule]` on completion: `INPUT[toggle:tasks_query_show_on_completion]`
start date: `INPUT[toggle:tasks_query_show_start_date]` scheduled date: `INPUT[toggle:tasks_query_show_scheduled_date]` due date: `INPUT[toggle:tasks_query_show_due_date]`
created date: `INPUT[toggle:tasks_query_show_created_date]` cancelled date: `INPUT[toggle:tasks_query_show_cancelled_date]` done date: `INPUT[toggle:tasks_query_show_done_date]`
urgency: `INPUT[toggle:tasks_query_show_urgency]`
backlink: `INPUT[toggle:tasks_query_show_backlink]`
edit button: `INPUT[toggle:tasks_query_show_edit_button]` postpone button: `INPUT[toggle:tasks_query_show_postpone_button]`
task count: `INPUT[toggle:tasks_query_show_task_count]`
extra instructions: `INPUT[textArea:tasks_query_extra_instructions]`
explain: `INPUT[toggle:tasks_query_explain]`
```
<!-- endSnippet -->

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

## Technical details

### Supported Query File Defaults property values

These are all the properties currently supported by Tasks, as Query File Defaults.

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
