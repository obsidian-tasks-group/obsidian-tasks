---
tasks_query_explain: false
tasks_query_short_mode: false
tasks_query_show_tree: true
tasks_query_show_tags: true
tasks_query_show_id: true
tasks_query_show_depends_on: true
tasks_query_show_priority: true
tasks_query_show_recurrence_rule: true
tasks_query_show_on_completion: true
tasks_query_show_created_date: true
tasks_query_show_start_date: true
tasks_query_show_scheduled_date: true
tasks_query_show_due_date: true
tasks_query_show_cancelled_date: true
tasks_query_show_done_date: true
tasks_query_show_urgency: true
tasks_query_show_backlink: true
tasks_query_show_edit_button: true
tasks_query_show_postpone_button: true
tasks_query_show_task_count: true
tasks_query_sort_by:
  - description
tasks_query_group_by:
  - status.type
  - happens reverse
  - function task.tags.sort().join(' ')
tasks_query_extra_instructions: |-
  # press shift-return to add new lines
  # not done
  # sort by done date
---
# Placeholder examples to capture in tests and docs

- [ ] #task Parent task #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ❌ 2023-07-06 ✅ 2023-07-05 ^dcf64c
  - [ ] #task Child task

## Can now have logical operators inside placeholders

So we can easily control the query interactively now, via Obsidian's File Properties panel!!!

This search is a proof-of-concept. The `tasks_query_` prefix was chosen to stand for `Task Query`. It is not yet decided whether recognition of these properties will be built in to Tasks in future.

To try this out:

1. Switch to Reading or Live Preview modes.
2. Run the `Files: Show file explorer` command.
3. Modify the query via only editing file properties.

For bonus points, you can copy the placeholder instructions to your Tasks global search, and then you can use these instructions to adjust *all* the searches in your vault that do not use `ignore global query`.

```tasks
# We ignore the global query just to shorten the `explain` output.
ignore global query
path includes {{query.file.path}}

# Instructions are listed in the order that items are displayed in Tasks search results

{{const prop = 'tasks_query_show_tree';              return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' tree' || ''}}

{{const prop = 'tasks_query_show_tags';              return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' tags' || ''}}
{{const prop = 'tasks_query_show_id';                return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' id' || ''}}
{{const prop = 'tasks_query_show_depends_on';        return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' depends on' || ''}}
{{const prop = 'tasks_query_show_priority';          return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' priority' || ''}}
{{const prop = 'tasks_query_show_recurrence_rule';   return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' recurrence rule' || ''}}
{{const prop = 'tasks_query_show_on_completion';     return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' on completion' || ''}}

{{const prop = 'tasks_query_show_created_date';      return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' created date' || ''}}
{{const prop = 'tasks_query_show_start_date';        return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' start date' || ''}}
{{const prop = 'tasks_query_show_scheduled_date';    return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' scheduled date' || ''}}
{{const prop = 'tasks_query_show_due_date';          return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' due date' || ''}}
{{const prop = 'tasks_query_show_cancelled_date';    return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' cancelled date' || ''}}
{{const prop = 'tasks_query_show_done_date';         return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' done date' || ''}}

{{const prop = 'tasks_query_show_urgency' ;          return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' urgency' || ''}}
{{const prop = 'tasks_query_show_backlink';          return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' backlink' || ''}}
{{const prop = 'tasks_query_show_edit_button';       return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' edit button' || ''}}
{{const prop = 'tasks_query_show_postpone_button';   return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' postpone button' || ''}}
{{const prop = 'tasks_query_show_task_count';        return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' task count' || ''}}

{{const prop = 'tasks_query_sort_by';                return query.file.hasProperty(prop) &&   query.file.property(prop).map((g) => 'sort by ' + g).join('\n') || ''}}
{{const prop = 'tasks_query_group_by';               return query.file.hasProperty(prop) &&   query.file.property(prop).map((g) => 'group by ' + g).join('\n') || ''}}

{{const prop = 'tasks_query_extra_instructions';     return query.file.hasProperty(prop) ? query.file.property(prop) || '' : '';}}
```

## Can now call functions inside placeholders

```tasks
ignore global query
explain
path includes {{query.file.path.toUpperCase()}}
```

## Expands to null, but should be an error

```tasks
ignore global query
explain
path includes {{query.file.path}}
{{query.file.property('stuff')}}
```

## Expands to false, but should be an error

```tasks
ignore global query
explain
path includes {{query.file.path}}
{{query.file.hasProperty('stuff')}}
```
