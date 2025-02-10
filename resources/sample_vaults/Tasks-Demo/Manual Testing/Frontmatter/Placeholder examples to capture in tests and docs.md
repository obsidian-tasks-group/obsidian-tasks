---
TQ_explain: false
TQ_extra_instructions: |-
  # press shift-return to add new lines
  # not done
  # sort by done date
  # ignore global query
TQ_short_mode: false
TQ_show_backlink: true
TQ_show_cancelled_date: true
TQ_show_created_date: true
TQ_show_depends_on: true
TQ_show_done_date: true
TQ_show_due_date: true
TQ_show_edit_button: true
TQ_show_id: true
TQ_show_on_completion: true
TQ_show_postpone_button: true
TQ_show_priority: true
TQ_show_recurrence_rule: true
TQ_show_scheduled_date: true
TQ_show_start_date: true
TQ_show_tags: true
TQ_show_task_count: true
TQ_show_tree: true
TQ_show_urgency: true
TQ_sort_by:
  - description
TQ_group_by:
  - status.type
  - happens reverse
  - function task.tags.sort().join(' ')
---

# Placeholder examples to capture in tests and docs

- [ ] #task Parent task #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ❌ 2023-07-06 ✅ 2023-07-05 ^dcf64c
  - [ ] #task Child task

<!-- placeholder to force blank line before included text --><!-- include: DocsSamplesForDefaults.test.DocsSamplesForDefaults_meta-bind-widgets-include.approved.md -->

short mode: `INPUT[toggle:TQ_short_mode]`
tree: `INPUT[toggle:TQ_show_tree]`
tags: `INPUT[toggle:TQ_show_tags]`
id: `INPUT[toggle:TQ_show_id]` depends on: `INPUT[toggle:TQ_show_depends_on]`
priority: `INPUT[toggle:TQ_show_priority]`
recurrence rule: `INPUT[toggle:TQ_show_recurrence_rule]` on completion: `INPUT[toggle:TQ_show_on_completion]`
start date: `INPUT[toggle:TQ_show_start_date]` scheduled date: `INPUT[toggle:TQ_show_scheduled_date]` due date: `INPUT[toggle:TQ_show_due_date]`
created date: `INPUT[toggle:TQ_show_created_date]` cancelled date: `INPUT[toggle:TQ_show_cancelled_date]` done date: `INPUT[toggle:TQ_show_done_date]`
urgency: `INPUT[toggle:TQ_show_urgency]`
backlink: `INPUT[toggle:TQ_show_backlink]`
edit button: `INPUT[toggle:TQ_show_edit_button]` postpone button: `INPUT[toggle:TQ_show_postpone_button]`
task count: `INPUT[toggle:TQ_show_task_count]`
extra instructions: `INPUT[textArea:TQ_extra_instructions]`
explain: `INPUT[toggle:TQ_explain]`

<!-- placeholder to force blank line after included text --><!-- endInclude -->

## Can now have logical operators inside placeholders

So we can easily control the query interactively now, via Obsidian's File Properties panel!!!

The `TQ_` prefix was chosen to stand for `Task Query`. Interpretation of all of these except `TQ_sort_by` and `TQ_group_by` is now built in to Tasks.

To try this out:

1. Enable the Obsidian core `Properties view` plugin.
2. Switch to Reading or Live Preview modes.
3. Run the `Properties view: Show file properties` command.
4. Modify the query via only editing file properties.

```tasks
path includes {{query.file.path}}

# Instructions are listed in the order that items are displayed in Tasks search results

{{const prop = 'TQ_sort_by';                return query.file.hasProperty(prop) &&   query.file.property(prop).map((g) => 'sort by ' + g).join('\n') || ''}}
{{const prop = 'TQ_group_by';               return query.file.hasProperty(prop) &&   query.file.property(prop).map((g) => 'group by ' + g).join('\n') || ''}}
```

## Can now call functions inside placeholders

```tasks
path includes {{query.file.path.toUpperCase()}}
```

## Expands to null, but should be an error

```tasks
path includes {{query.file.path}}
{{query.file.property('stuff')}}
```

## Works correctly when property is not set

```tasks
path includes {{query.file.path}}
{{query.file.property('stuff') ?? ''}}
```

## Expands to false, but should be an error

```tasks
path includes {{query.file.path}}
{{query.file.hasProperty('stuff')}}
```
