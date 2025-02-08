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
2. Add one or more `TQ_*` properties to the file
    - Click on `Add property`.
    - Start typing `TQ_`, or any part of the property names list in [[#Supported Query File Defaults property values]] below.
    - Press `<Return>` or `<Enter>` to add the property.
3. Now you can modify these `TQ_*` properties to change the behaviour of all the Tasks searches in this file.

> [!tip]
> Use the command **Tasks: Add all Query File Defaults properties** to add all the available `TQ_*` properties to the active note in one simple step.

#### Widening property names in Obsidian

By default, the property names are very narrow in Obsidian.

You can make them wider with the following CSS Snippet.

<!-- snippet: resources/sample_vaults/Tasks-Demo/.obsidian/snippets/widen-property-labels.css -->
```css
/* Make property labels wider, to fit the names of Tasks-specific properties */
.metadata-content {
    --metadata-label-width: 14em;
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
TQ_explain:
TQ_extra_instructions:
TQ_short_mode:
TQ_show_backlink:
TQ_show_cancelled_date:
TQ_show_created_date:
TQ_show_depends_on:
TQ_show_done_date:
TQ_show_due_date:
TQ_show_edit_button:
TQ_show_id:
TQ_show_on_completion:
TQ_show_postpone_button:
TQ_show_priority:
TQ_show_recurrence_rule:
TQ_show_scheduled_date:
TQ_show_start_date:
TQ_show_tags:
TQ_show_task_count:
TQ_show_tree:
TQ_show_urgency:
---
```
<!-- endSnippet -->

> [!tip]
> Use the command **Tasks: Add all Query File Defaults properties** to add all these properties to the active note.

### Types of Query File Defaults property values

These are all the types of properties currently supported by Tasks, as Query
File Defaults.

> [!tip]
> The Tasks plugin automatically adds these properties to the Obsidian vault.

<!-- snippet: DocsSamplesForDefaults.test.DocsSamplesForDefaults_fake-types.json.approved.json -->
```json
{
  "types": {
    "TQ_explain": "checkbox",
    "TQ_extra_instructions": "text",
    "TQ_short_mode": "checkbox",
    "TQ_show_backlink": "checkbox",
    "TQ_show_cancelled_date": "checkbox",
    "TQ_show_created_date": "checkbox",
    "TQ_show_depends_on": "checkbox",
    "TQ_show_done_date": "checkbox",
    "TQ_show_due_date": "checkbox",
    "TQ_show_edit_button": "checkbox",
    "TQ_show_id": "checkbox",
    "TQ_show_on_completion": "checkbox",
    "TQ_show_postpone_button": "checkbox",
    "TQ_show_priority": "checkbox",
    "TQ_show_recurrence_rule": "checkbox",
    "TQ_show_scheduled_date": "checkbox",
    "TQ_show_start_date": "checkbox",
    "TQ_show_tags": "checkbox",
    "TQ_show_task_count": "checkbox",
    "TQ_show_tree": "checkbox",
    "TQ_show_urgency": "checkbox"
  }
}
```
<!-- endSnippet -->
