---
explain: false
show-tree: true
show-tags: true
show-id: true
show-depends-on: true
show-priority: true
show-recurrence-rule: true
show-on completion: true
show-created-date: true
show-start-date: true
show-scheduled-date: true
show-due-date: true
show-cancelled-date: true
show-done-date: true
show-urgency: false
show-backlink: true
show-edit-button: true
show-postpone-button: true
show-task-count: true
---
# Placeholder examples to capture in tests and docs

- [ ] #task Parent task #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ❌ 2023-07-06 ✅ 2023-07-05 ^dcf64c
  - [ ] #task Child task

## Can now have logical operators inside placeholders

So we can easily control the query interactively now, via Obsidian's File Properties panel!!!

```tasks
ignore global query
path includes {{query.file.path}}

# Instructions are listed in the order that items are displayed in Tasks search results
# I would like to use the prefix 'tasks-query-' on the names, but it makes the names
# too wide to be readable in the File Properties panel.
{{query.file.hasProperty('explain')               && (query.file.property('explain')               ? 'explain' : '')                        || ''}}
{{query.file.hasProperty('show-tree')             && (query.file.property('show-tree')             ? 'show' : 'hide') + ' tree'             || ''}}
{{query.file.hasProperty('show-tags')             && (query.file.property('show-tags')             ? 'show' : 'hide') + ' tags'             || ''}}
{{query.file.hasProperty('show-id')               && (query.file.property('show-id')               ? 'show' : 'hide') + ' id'               || ''}}
{{query.file.hasProperty('show-depends-on')       && (query.file.property('show-depends-on')       ? 'show' : 'hide') + ' depends on'       || ''}}
{{query.file.hasProperty('show-priority')         && (query.file.property('show-priority')         ? 'show' : 'hide') + ' priority'         || ''}}
{{query.file.hasProperty('show-recurrence-rule')  && (query.file.property('show-recurrence-rule')  ? 'show' : 'hide') + ' recurrence rule'  || ''}}
{{query.file.hasProperty('show-on completion')    && (query.file.property('show-on completion')    ? 'show' : 'hide') + ' on completion'    || ''}}
{{query.file.hasProperty('show-created-date')     && (query.file.property('show-created-date')     ? 'show' : 'hide') + ' created date'     || ''}}
{{query.file.hasProperty('show-start-date')       && (query.file.property('show-start-date')       ? 'show' : 'hide') + ' start date'       || ''}}
{{query.file.hasProperty('show-scheduled-date')   && (query.file.property('show-scheduled-date')   ? 'show' : 'hide') + ' scheduled date'   || ''}}
{{query.file.hasProperty('show-due-date')         && (query.file.property('show-due-date')         ? 'show' : 'hide') + ' due date'         || ''}}
{{query.file.hasProperty('show-cancelled-date')   && (query.file.property('show-cancelled-date')   ? 'show' : 'hide') + ' cancelled date'   || ''}}
{{query.file.hasProperty('show-done-date')        && (query.file.property('show-done-date')        ? 'show' : 'hide') + ' done date'        || ''}}
{{query.file.hasProperty('show-urgency' )         && (query.file.property('show-urgency' )         ? 'show' : 'hide') + ' urgency'          || ''}}
{{query.file.hasProperty('show-backlink')         && (query.file.property('show-backlink')         ? 'show' : 'hide') + ' backlink'         || ''}}
{{query.file.hasProperty('show-edit-button')      && (query.file.property('show-edit-button')      ? 'show' : 'hide') + ' edit button'      || ''}}
{{query.file.hasProperty('show-postpone-button')  && (query.file.property('show-postpone-button')  ? 'show' : 'hide') + ' postpone button'  || ''}}
{{query.file.hasProperty('show-task-count')       && (query.file.property('show-task-count')       ? 'show' : 'hide') + ' task count'       || ''}}
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
