---
tasks-query-explain: false
tasks-query-short-mode: false
tasks-query-show-tree: true
tasks-query-show-tags: true
tasks-query-show-id: true
tasks-query-show-depends-on: true
tasks-query-show-priority: true
tasks-query-show-recurrence-rule: true
tasks-query-show-on-completion: true
tasks-query-show-created-date: true
tasks-query-show-start-date: true
tasks-query-show-scheduled-date: true
tasks-query-show-due-date: true
tasks-query-show-cancelled-date: true
tasks-query-show-done-date: true
tasks-query-show-urgency: true
tasks-query-show-backlink: true
tasks-query-show-edit-button: true
tasks-query-show-postpone-button: true
tasks-query-show-task-count: true
tasks-query-sort-by:
  - description
tasks-query-group-by:
  - status.type
  - happens reverse
  - function task.tags.sort().join(' ')
tasks-query-extra-instructions: |-
  # press shift-return to add new lines
  # not done
  # sort by done date
---
# Placeholder examples to capture in tests and docs

- [ ] #task Parent task #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ❌ 2023-07-06 ✅ 2023-07-05 ^dcf64c
  - [ ] #task Child task

## Can now have logical operators inside placeholders

So we can easily control the query interactively now, via Obsidian's File Properties panel!!!

This search is a proof-of-concept. The `tasks-query-` prefix was chosen to stand for `Task Query`. It is not yet decided whether recognition of these properties will be built in to Tasks in future.

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
# I would like to use the prefix 'tasks-query-' on the names, but it makes the names
# too wide to be readable in the File Properties panel.

{{const prop = 'tasks-query-explain';                return query.file.hasProperty(prop) ?  ( query.file.property(prop) ? 'explain' : '') : '';}}

{{const prop = 'tasks-query-show-tree';              return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' tree' || ''}}

{{const prop = 'tasks-query-show-tags';              return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' tags' || ''}}
{{const prop = 'tasks-query-show-id';                return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' id' || ''}}
{{const prop = 'tasks-query-show-depends-on';        return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' depends on' || ''}}
{{const prop = 'tasks-query-show-priority';          return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' priority' || ''}}
{{const prop = 'tasks-query-show-recurrence-rule';   return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' recurrence rule' || ''}}
{{const prop = 'tasks-query-show-on-completion';     return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' on completion' || ''}}

{{const prop = 'tasks-query-show-created-date';      return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' created date' || ''}}
{{const prop = 'tasks-query-show-start-date';        return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' start date' || ''}}
{{const prop = 'tasks-query-show-scheduled-date';    return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' scheduled date' || ''}}
{{const prop = 'tasks-query-show-due-date';          return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' due date' || ''}}
{{const prop = 'tasks-query-show-cancelled-date';    return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' cancelled date' || ''}}
{{const prop = 'tasks-query-show-done-date';         return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' done date' || ''}}

{{const prop = 'tasks-query-show-urgency' ;          return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' urgency' || ''}}
{{const prop = 'tasks-query-show-backlink';          return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' backlink' || ''}}
{{const prop = 'tasks-query-show-edit-button';       return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' edit button' || ''}}
{{const prop = 'tasks-query-show-postpone-button';   return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' postpone button' || ''}}
{{const prop = 'tasks-query-show-task-count';        return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' task count' || ''}}

{{const prop = 'tasks-query-sort-by';                return query.file.hasProperty(prop) &&   query.file.property(prop).map((g) => 'sort by ' + g).join('\n') || ''}}
{{const prop = 'tasks-query-group-by';               return query.file.hasProperty(prop) &&   query.file.property(prop).map((g) => 'group by ' + g).join('\n') || ''}}

{{const prop = 'tasks-query-extra-instructions';     return query.file.hasProperty(prop) ? query.file.property(prop) || '' : '';}}
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
