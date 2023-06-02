---
publish: true
---

# Tasks Emoji Format

<span class="related-pages">#task-formats #task-format/tasks</span>

These samples demonstrate all the fields supported by the Tasks plugin's parsing of its own emoji signifiers.

## Tasks Emoji Format for Dates

```markdown
- [ ] #task Has a created date ➕ 2023-04-13
- [ ] #task Has a scheduled date ⏳ 2023-04-14
- [ ] #task Has a start date 🛫 2023-04-15
- [ ] #task Has a due date 📅 2023-04-16
- [x] #task Has a done date ✅ 2023-04-17
```

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
