---
TQ-explain: false
TQ-short-mode: false
TQ-show-tree: true
TQ-show-tags: true
TQ-show-id: true
TQ-show-depends-on: true
TQ-show-priority: true
TQ-show-recurrence-rule: true
TQ-show-on-completion: true
TQ-show-created-date: true
TQ-show-start-date: true
TQ-show-scheduled-date: true
TQ-show-due-date: true
TQ-show-cancelled-date: true
TQ-show-done-date: true
TQ-show-urgency: true
TQ-show-backlink: true
TQ-show-edit-button: true
TQ-show-postpone-button: true
TQ-show-task-count: true
TQ-sort-by:
  - description
TQ-group-by:
  - status.type
  - happens reverse
  - function task.tags.sort().join(' ')
TQ-extra-instructions: |-
  # press shift-return to add new lines
  # not done
  # sort by done date
---
# Placeholder examples to capture in tests and docs

- [ ] #task Parent task #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ❌ 2023-07-06 ✅ 2023-07-05 ^dcf64c
  - [ ] #task Child task

## Can now have logical operators inside placeholders

So we can easily control the query interactively now, via Obsidian's File Properties panel!!!

This search is a proof-of-concept. The `TQ-` prefix was chosen to stand for `Task Query`. It is not yet decided whether recognition of these properties will be built in to Tasks in future.

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

{{const prop = 'TQ-explain';                return query.file.hasProperty(prop) ?  ( query.file.property(prop) ? 'explain' : '') : '';}}
{{const prop = 'TQ-short-mode';             return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'short mode' : 'full mode') || ''}}

{{const prop = 'TQ-show-tree';              return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' tree' || ''}}

{{const prop = 'TQ-show-tags';              return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' tags' || ''}}
{{const prop = 'TQ-show-id';                return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' id' || ''}}
{{const prop = 'TQ-show-depends-on';        return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' depends on' || ''}}
{{const prop = 'TQ-show-priority';          return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' priority' || ''}}
{{const prop = 'TQ-show-recurrence-rule';   return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' recurrence rule' || ''}}
{{const prop = 'TQ-show-on-completion';     return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' on completion' || ''}}

{{const prop = 'TQ-show-created-date';      return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' created date' || ''}}
{{const prop = 'TQ-show-start-date';        return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' start date' || ''}}
{{const prop = 'TQ-show-scheduled-date';    return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' scheduled date' || ''}}
{{const prop = 'TQ-show-due-date';          return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' due date' || ''}}
{{const prop = 'TQ-show-cancelled-date';    return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' cancelled date' || ''}}
{{const prop = 'TQ-show-done-date';         return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' done date' || ''}}

{{const prop = 'TQ-show-urgency' ;          return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' urgency' || ''}}
{{const prop = 'TQ-show-backlink';          return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' backlink' || ''}}
{{const prop = 'TQ-show-edit-button';       return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' edit button' || ''}}
{{const prop = 'TQ-show-postpone-button';   return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' postpone button' || ''}}
{{const prop = 'TQ-show-task-count';        return query.file.hasProperty(prop) && ( query.file.property(prop) ? 'show' : 'hide') + ' task count' || ''}}

{{const prop = 'TQ-sort-by';                return query.file.hasProperty(prop) &&   query.file.property(prop).map((g) => 'sort by ' + g).join('\n') || ''}}
{{const prop = 'TQ-group-by';               return query.file.hasProperty(prop) &&   query.file.property(prop).map((g) => 'group by ' + g).join('\n') || ''}}

{{const prop = 'TQ-extra-instructions';     return query.file.hasProperty(prop) ? query.file.property(prop) || '' : '';}}
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
