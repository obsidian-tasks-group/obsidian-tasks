---
publish: true
---

# Tasks Emoji Format

<span class="related-pages">#task-formats #task-format/tasks</span>

These samples demonstrate all the fields supported by the Tasks plugin's parsing of its own emoji signifiers.

<!-- NEW_TASK_FIELD_EDIT_REQUIRED -->

## Tasks Emoji Format for Dates

<!-- snippet: DocsSamplesForTaskFormats.test.Serializer_Dates_tasksPluginEmoji-snippet.approved.md -->
```md
- [ ] #task Has a created date ➕ 2023-04-13
- [ ] #task Has a scheduled date ⏳ 2023-04-14
- [ ] #task Has a start date 🛫 2023-04-15
- [ ] #task Has a due date 📅 2023-04-16
- [x] #task Has a done date ✅ 2023-04-17
- [-] #task Has a cancelled date ❌ 2023-04-18
```
<!-- endSnippet -->

For more information, see [[Dates]].

## Tasks Emoji Format for Priorities

<!-- snippet: DocsSamplesForTaskFormats.test.Serializer_Priorities_tasksPluginEmoji-snippet.approved.md -->
```md
- [ ] #task Lowest priority ⏬
- [ ] #task Low priority 🔽
- [ ] #task Normal priority
- [ ] #task Medium priority 🔼
- [ ] #task High priority ⏫
- [ ] #task Highest priority 🔺
```
<!-- endSnippet -->

For more information, see [[Priority]].

## Tasks Emoji Format for Recurrence

```markdown
- [ ] #task Is a recurring task 🔁 every day when done
```

For more information, see [[Recurring Tasks]].

## Tasks Emoji  Format for Dependencies

<!-- snippet: DocsSamplesForTaskFormats.test.Serializer_Dependencies_tasksPluginEmoji-snippet.approved.md -->
```md
- [ ] #task do this first 🆔 dcf64c
- [ ] #task do this after first and some other task ⛔ dcf64c,0h17ye
```
<!-- endSnippet -->

For more information, see [[Task Dependencies]].

## Limitations of Tasks Emoji Format

### Non-breaking spaces: NBSP characters

When copying and pasting text from websites, spaces are sometimes pasted in as `NBSP` characters.

These are generally visible in text editors, but in Obsidian they look like ordinary spaces.

Tasks does not currently treat these characters as spaces, and so emojis and their values may not be read correctly.

We are tracking this in [issue #606](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/606).

### Manual 'double up' arrow emoji not recognised

See [[Tasks Emoji Format#Unicode Variation Selectors]] below.

### Unicode Variation Selectors

Tasks does not understand unicode [Variation Selectors](https://en.wikipedia.org/wiki/Variation_Selectors_(Unicode_block)).

There has been a report of this preventing Tasks from reading the High Priority emoji (⏫) correctly, when added manually.

We are tracking this in [issue #2273](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2273).
