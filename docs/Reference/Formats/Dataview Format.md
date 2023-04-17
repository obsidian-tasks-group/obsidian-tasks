---
publish: true
---

# Dataview Format

<span class="related-pages">#formats #format/dataview #plugin/dataview</span>

These samples demonstrate all the fields supported by the Tasks plugin's parsing of dataview fields.

## Dataview Format Dates

These names agree with the same fields in [dataview's documentation](https://blacksmithgu.github.io/obsidian-dataview/annotation/metadata-tasks/#field-shorthands).

```markdown
- [ ] #task Has a created date [created:: 2023-04-17]
- [ ] #task Has a scheduled date [scheduled:: 2023-04-14]
- [ ] #task Has a start date [start:: 2023-04-15]
- [ ] #task Has a due date [due:: 2023-04-16]
- [x] #task Has a done date [completion:: 2023-04-17]
```

For more information, see [[Dates]].

## Dataview Format for Priorities

These names were chosen for use in Tasks, and are not known to dataview. They can of course be searched in dataview.

```markdown
- [ ] #task Low priority [priority:: low]
- [ ] #task Normal priority
- [ ] #task Medium priority [priority:: medium]
- [ ] #task High priority [priority:: high]
```

For more information, see [[Priority]].

## Dataview Format for Recurrence

This name was chosen for use in Tasks, because it is suggested in the [dataview feature request #878](https://github.com/blacksmithgu/obsidian-dataview/issues/878). It is not yet known to dataview. It can of course be searched in dataview.

```markdown
- [ ] #task Is a recurring task [repeat:: every day when done]
```

For more information, see [[Recurring Tasks]].
