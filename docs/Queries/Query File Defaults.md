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

## Applying instructions to every Tasks search in a file

### Obsidian-native User Interface

You can use the Obsidian **File properties** view to customise Tasks searches:

![Obsidian's 'File properties' widget, with checkboxes and a text box to modify query file defaults for a file containing Tasks searches.](../images/query-file-defaults-file-properties-controls.png)
<span class="caption">Obsidian's **File properties** widget, with checkboxes and a text box to modify query file defaults for a file containing Tasks searches. See [[#Widening property names in Obsidian]] for the CSS snippet used to widen property names.</span>

To try this out:

1. Show the `File properties` panel:
    - Enable the Obsidian core Properties view plugin: `Settings` > `Core plugins` > turn on `Properties view`
    - Switch to Reading or Live Preview modes.
    - Run the `Properties view: Show file properties` command.
2. Add one or more `tasks_query_*` properties to the file
    - Click on `Add property`.
    - Start typing `tasks_query_`.
    - Or you can paste in property names from the [[#Supported Query File Defaults property values]] section below.
    - Press `<Return>` or `<Enter>` to add the property.
3. Now you can modify these `tasks_query_*` properties to change the behaviour of Tasks searches in this file.

> [!info]
> We plan to streamline the addition of these properties to notes.

#### Widening property names in Obsidian

By default, the property names are very narrow in Obsidian.

You can make them wider with the following CSS Snippet.

<!-- snippet: resources/sample_vaults/Tasks-Demo/.obsidian/snippets/widen-property-labels.css -->
```css
/* Make property labels wider, to fit the names of Tasks-specific properties */
.metadata-content {
    --metadata-label-width: 18em;
}
```
<!-- endSnippet -->

The Obsidian user guide shows how to [use CSS snippets in Obsidian](https://help.obsidian.md/How+to/Add+custom+styles#Use+Themes+and+or+CSS+snippets).

### Meta Bind User Interface

You can use the [Meta Bind](https://obsidian.md/plugins?search=Meta%20Bind) plugin to create a User Interface to easily change your Tasks searches:

![Meta Bind widgets to edit Query File Defaults](../images/query-file-defaults-meta-bind-controls.png)
<span class="caption">Meta Bind widgets to edit Query File Defaults</span>

> [!info]- Set up Meta Bind widgets to edit Query File Defaults
> Steps to do this, which assume you have already [turned off Obsidian's Restricted mode](https://help.obsidian.md/Extending+Obsidian/Plugin+security):
>
> 1. Install and enable [Meta Bind](https://obsidian.md/plugins?search=Meta%20Bind)
> 2. Click the Copy button to copy the Markdown below.
> 3. Paste the markdown in to a note in Obsidian that has one or more Tasks searches.
> 4. Switch to Live Preview or Reading modes, to see the widgets.
> 5. After experimenting, delete any labels and widgets that you do not need.
>
> ![[Meta Bind Query Widgets]]

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

### Types of Query File Defaults property values

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
