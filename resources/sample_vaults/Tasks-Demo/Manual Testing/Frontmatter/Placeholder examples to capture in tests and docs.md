---
TQ-explain: true
TQ-short-mode: false
TQ-show-tree: true
TQ-show-tags: true
TQ-show-id: true
TQ-show-depends-on: true
TQ-show-priority: true
TQ-show-recurrence-rule: true
TQ-show-on completion: true
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

{{query.file.hasProperty('TQ-explain') \
 && (query.file.property('TQ-explain') \
 ? 'explain' : '')  \
 || ''}}

{{query.file.hasProperty('TQ-short-mode') \
 && (query.file.property('TQ-short-mode') \
 ? 'short mode' : 'full mode')  \
 || ''}}

{{query.file.hasProperty('TQ-show-tree') \
 && (query.file.property('TQ-show-tree') \
 ? 'show' : 'hide') +           ' tree'  \
 || ''}}

{{query.file.hasProperty('TQ-show-tags') \
 && (query.file.property('TQ-show-tags') \
 ? 'show' : 'hide') +           ' tags'  \
 || ''}}

{{query.file.hasProperty('TQ-show-id') \
 && (query.file.property('TQ-show-id') \
 ? 'show' : 'hide') +           ' id'  \
 || ''}}

{{query.file.hasProperty('TQ-show-depends-on') \
 && (query.file.property('TQ-show-depends-on') \
 ? 'show' : 'hide') +           ' depends on'  \
 || ''}}

{{query.file.hasProperty('TQ-show-priority') \
 && (query.file.property('TQ-show-priority') \
 ? 'show' : 'hide') +           ' priority'  \
 || ''}}

{{query.file.hasProperty('TQ-show-recurrence-rule') \
 && (query.file.property('TQ-show-recurrence-rule') \
 ? 'show' : 'hide') +           ' recurrence rule'  \
 || ''}}

{{query.file.hasProperty('TQ-show-on completion') \
 && (query.file.property('TQ-show-on completion') \
 ? 'show' : 'hide') +           ' on completion'  \
 || ''}}

{{query.file.hasProperty('TQ-show-created-date') \
 && (query.file.property('TQ-show-created-date') \
 ? 'show' : 'hide') +           ' created date'  \
 || ''}}

{{query.file.hasProperty('TQ-show-start-date') \
 && (query.file.property('TQ-show-start-date') \
 ? 'show' : 'hide') +           ' start date'  \
 || ''}}

{{query.file.hasProperty('TQ-show-scheduled-date') \
 && (query.file.property('TQ-show-scheduled-date') \
 ? 'show' : 'hide') +           ' scheduled date'  \
 || ''}}

{{query.file.hasProperty('TQ-show-due-date') \
 && (query.file.property('TQ-show-due-date') \
 ? 'show' : 'hide') +           ' due date'  \
 || ''}}

{{query.file.hasProperty('TQ-show-cancelled-date') \
 && (query.file.property('TQ-show-cancelled-date') \
 ? 'show' : 'hide') +           ' cancelled date'  \
 || ''}}

{{query.file.hasProperty('TQ-show-done-date') \
 && (query.file.property('TQ-show-done-date') \
 ? 'show' : 'hide') +           ' done date'  \
 || ''}}

{{query.file.hasProperty('TQ-show-urgency' )  \
 && (query.file.property('TQ-show-urgency' )  \
 ? 'show' : 'hide') +           ' urgency'  \
 || ''}}

{{query.file.hasProperty('TQ-show-backlink') \
 && (query.file.property('TQ-show-backlink') \
 ? 'show' : 'hide') +           ' backlink'  \
 || ''}}

{{query.file.hasProperty('TQ-show-edit-button') \
 && (query.file.property('TQ-show-edit-button') \
 ? 'show' : 'hide') +           ' edit button'  \
 || ''}}

{{query.file.hasProperty('TQ-show-postpone-button') \
 && (query.file.property('TQ-show-postpone-button') \
 ? 'show' : 'hide') +           ' postpone button'  \
 || ''}}

{{query.file.hasProperty('TQ-show-task-count') \
 && (query.file.property('TQ-show-task-count') \
 ? 'show' : 'hide') +           ' task count'  \
 || ''}}

{{query.file.hasProperty('TQ-sort-by') \
 &&  query.file.property('TQ-sort-by').map((g) => 'sort by ' + g).join('\n') \
 || ''}}

{{query.file.hasProperty('TQ-group-by') \
 &&  query.file.property('TQ-group-by').map((g) => 'group by ' + g).join('\n') \
 || ''}}
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
