---
publish: true
---

# Dataview Format

<span class="related-pages">#task-formats #task-format/dataview #plugin/dataview</span>

## Reading and writing dataview format

> [!released]
> Introduced in Tasks 3.3.0.

Tasks now has evolving support for the dataview plugin's text-based format for adding data to task lines.

> [!Warning]
> Currently, support of dataview format is partial, with some important differences from the dataview behaviour.
>
> We will work to improve compatibility, but in the meantime, **please do read this page carefully**.

## Bracketed inline fields

Tasks specifically reads [Dataview's Bracketed inline fields](https://blacksmithgu.github.io/obsidian-dataview/annotation/add-metadata/#inline-fields) in task list items.

This means you need to write the `key:: value` strings on Tasks lines surrounded by *either* `[]` or `()`.

Note, however, that when Tasks *writes* task lines, it always writes them with `[]`, even if they were initially written as `()`.

The brackets `[]` and `()` differ in how [Dataview displays them](https://blacksmithgu.github.io/obsidian-dataview/annotation/add-metadata/#inline-fields). With the parenthesis syntax, Dataview only shows the field value and not the key.

### Ensuring correct display in Live Preview

> [!tip]
> If, in Source or Live Preview, **any of your dataview fields are underlined**, to ensure you see all your data in Live Preview, you should **separate the fields** with one of:
>
> - 2 spaces
> - a comma and a space
>
> The [[Create or edit Task]] modal puts 2 spaces between dataview fields automatically.

> [!warning]
> `[Text][More Text]` is a Markdown feature called a [reference-style link](https://daringfireball.net/projects/markdown/syntax#link).
>
> If Live Preview in Obsidian is **enabled**, Obsidian will **hide** everything inside the second set of square brackets.
>
> So a task with multiple inline fields:
>
> ```text
> - [ ] This is a task [priority:: high] [start:: 2023-04-24] [due:: 2023-05-01]
> ```
>
> Will look like this with Live Preview enabled:
>
> > - [ ] This is a task <u>priority:: high</u> [due:: 2023-05-01]
>
> ---
>
> This issue is outside the scope of the Tasks plugin, but can be avoided with any of the following workarounds:
>
> - Turning **off** Live Preview in Obsidian.
> - Separating each field with at least 2 spaces.
>
> > [!example]
>   >
>   > ```text
>   >  - [ ] This is a task [priority:: high]  [start:: 2023-04-24]  [due:: 2023-05-01]
>   >  ```
>
> - Separating each field with commas.
>
> > [!example]
>   >
>   > ```text
>   >  - [ ] This is a task [priority:: high], [start:: 2023-04-24], [due:: 2023-05-01]
>   > ```

## Supported dataview fields

These samples demonstrate all the fields supported by the Tasks plugin's parsing of dataview fields.

> [!Tip]
> All the examples below work show the fields in square brackets: `[...]`.
>
> Tasks also reads dataview fields in parentheses: `(...)`.

<!-- NEW_TASK_FIELD_EDIT_REQUIRED -->

### Dataview Format for Dates

These names agree with the same fields in [dataview's documentation](https://blacksmithgu.github.io/obsidian-dataview/annotation/metadata-tasks/#field-shorthands).

<!-- snippet: DocsSamplesForTaskFormats.test.Serializer_Dates_dataview-snippet.approved.md -->
```md
- [ ] #task Has a created date  [created:: 2023-04-13]
- [ ] #task Has a scheduled date  [scheduled:: 2023-04-14]
- [ ] #task Has a start date  [start:: 2023-04-15]
- [ ] #task Has a due date  [due:: 2023-04-16]
- [x] #task Has a done date  [completion:: 2023-04-17]
- [-] #task Has a cancelled date  [cancelled:: 2023-04-18]
```
<!-- endSnippet -->

For more information, see [[Dates]].

### Dataview Format for Priorities

> [!Info]
> These names were chosen for use in Tasks, and are not known to dataview. They can of course be searched in dataview.

<!-- snippet: DocsSamplesForTaskFormats.test.Serializer_Priorities_dataview-snippet.approved.md -->
```md
- [ ] #task Lowest priority  [priority:: lowest]
- [ ] #task Low priority  [priority:: low]
- [ ] #task Normal priority
- [ ] #task Medium priority  [priority:: medium]
- [ ] #task High priority  [priority:: high]
- [ ] #task Highest priority  [priority:: highest]
```
<!-- endSnippet -->

For more information, see [[Priority]].

### Dataview Format for Recurrence

> [!Info]
> This name was chosen for use in Tasks, because it is suggested in the [dataview feature request #878](https://github.com/blacksmithgu/obsidian-dataview/issues/878). It is not yet known to dataview. It can of course be searched in dataview.

```markdown
- [ ] #task Is a recurring task [repeat:: every day when done]
```

For more information, see [[Recurring Tasks]].

### Dataview Format for Dependencies

<!-- snippet: DocsSamplesForTaskFormats.test.Serializer_Dependencies_dataview-snippet.approved.md -->
```md
- [ ] #task do this first  [id:: dcf64c]
- [ ] #task do this after first and some other task  [dependsOn:: dcf64c,0h17ye]
```
<!-- endSnippet -->

For more information, see [[Task Dependencies]].

## Auto-Suggest and Dataview format

The Dataview format fully supports Tasks' [[Auto-Suggest]] feature, but requires users to manually type out surrounding brackets (`[]` or `()`).  This works best with `Settings > Editor > Autopair Brackets` enabled.

Since Tasks 4.6.1, the Auto-Suggest menu *only* appears between square brackets `[]` or parentheses `()`.

## Limitations of Dataview Format

Essential reading:

- [[About Task Formats#Impact of non-default task formats on Tasks behaviour]]
- [[About Task Formats#Limitations of task format support]]

Additional limitations, compared to the Dataview's own parsing of task lines:

- Tasks cannot yet read Dataview fields arbitrarily anywhere within a task line, even though Dataview allows this.
- Tasks currently only reads Dataview fields from task lines that match any global filter.
  - It does not yet read fields from [frontmatter](https://blacksmithgu.github.io/obsidian-dataview/annotation/add-metadata/#frontmatter).
  - It does not read [inline fields](https://blacksmithgu.github.io/obsidian-dataview/annotation/add-metadata/#inline-fields) outside of lines already considered to be tasks.
