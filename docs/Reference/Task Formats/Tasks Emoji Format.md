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

## Tasks Emoji Format for OnCompletion

<!-- snippet: DocsSamplesForTaskFormats.test.Serializer_OnCompletion_tasksPluginEmoji-snippet.approved.md -->
```md
- [ ] #task Keep this task when done
- [ ] #task Keep this task when done too 🏁 keep
- [ ] #task Remove this task when done 🏁 delete
- [ ] #task Remove completed instance of this recurring task when done 🔁 every day 🏁 delete
```
<!-- endSnippet -->

For more information, see [[On Completion]].

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

## Support

Before creating a new bug report or feature request about Tasks Emoji Format, please check existing items to avoid duplicates.

You do not need to search manually: the links below are already filtered to the label `"scope: emojis and signifiers"`.

- Check both Open and Closed items.
- If you find an existing item, support it there instead of adding a `+1` comment. See [[About Support and Help#How to support an existing request|How to support an existing request]].

| Type | Open | Closed | Notes |
| --- | --- | --- | --- |
| Issues | [Open](https://github.com/obsidian-tasks-group/obsidian-tasks/issues?q=is%3Aopen%20label%3A%22scope%3A+emojis+and+signifiers%22%20is%3Aissue%20) | [Closed](https://github.com/obsidian-tasks-group/obsidian-tasks/issues?q=is%3Aclosed%20label%3A%22scope%3A+emojis+and+signifiers%22%20is%3Aissue%20) | bug reports and feature requests |
| Discussions | [Open](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/categories/ideas-any-new-feature-requests-go-in-issues-please?discussions_q=is%3Aopen+label%3A%22scope%3A+emojis+and+signifiers%22+category%3A%22Ideas%3A+Any+New+Feature+Requests+go+in+Issues+please%22+sort%3Atop) | [Closed](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/categories/ideas-any-new-feature-requests-go-in-issues-please?discussions_q=is%3Aclosed+label%3A%22scope%3A+emojis+and+signifiers%22+category%3A%22Ideas%3A+Any+New+Feature+Requests+go+in+Issues+please%22+sort%3Atop) | older feature discussions from before late 2022 |

If you do not find an existing item in Issues or Discussions, see [[About Support and Help]] for how to report a bug or request a feature.
