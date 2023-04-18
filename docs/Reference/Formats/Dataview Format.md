---
publish: true
---

# Dataview Format

<span class="related-pages">#formats #format/dataview #plugin/dataview</span>

## Reading and writing dataview format

> [!released]
> Introduced in Tasks X.Y.Z.

Tasks now has evolving support for the dataview plugin's text-based format for adding data to task lines.

> [!Warning]
> Currently, support of dataview format is partial, with some important differences from the dataview behaviour.
>
> We will work to improve compatibility, but in the meantime, **please do read this page carefully**.

## Brackets

Requires `[]` or `()` around fields

Document difference between the two

Link to the relevant bit of dataview docs

## Supported dataview fields

These samples demonstrate all the fields supported by the Tasks plugin's parsing of dataview fields.

### Dataview Format for Dates

These names agree with the same fields in [dataview's documentation](https://blacksmithgu.github.io/obsidian-dataview/annotation/metadata-tasks/#field-shorthands).

```markdown
- [ ] #task Has a created date [created:: 2023-04-17]
- [ ] #task Has a scheduled date [scheduled:: 2023-04-14]
- [ ] #task Has a start date [start:: 2023-04-15]
- [ ] #task Has a due date [due:: 2023-04-16]
- [x] #task Has a done date [completion:: 2023-04-17]
```

For more information, see [[Dates]].

### Dataview Format for Priorities

These names were chosen for use in Tasks, and are not known to dataview. They can of course be searched in dataview.

```markdown
- [ ] #task Low priority [priority:: low]
- [ ] #task Normal priority
- [ ] #task Medium priority [priority:: medium]
- [ ] #task High priority [priority:: high]
```

For more information, see [[Priority]].

### Dataview Format for Recurrence

This name was chosen for use in Tasks, because it is suggested in the [dataview feature request #878](https://github.com/blacksmithgu/obsidian-dataview/issues/878). It is not yet known to dataview. It can of course be searched in dataview.

```markdown
- [ ] #task Is a recurring task [repeat:: every day when done]
```

For more information, see [[Recurring Tasks]].

## Limitations of Dataview Format

[[Auto-Suggest]] - start by typing `[]` or `()` - then type field names inside your chosen brackets.

## Comparison of Tasks and Dataview formats

| Facility                          | Dataview interpretation of dataview format                                                        | Tasks' interpretation of dataview format                 |
| --------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Reading multiple formats          | Reads both Dataview and Tasks formats, so can read a task that has both dataview and tasks format | Only reads the format that was selected at launch        |
| Order of fields on the Tasks line | Fields and free text can be mixed together within the task line                                   | Reads fields and tags backwards from the end of the line |
| Data from other lines             |                                                                                                   | Does not read from frontmatter, inline fields, headings  |
