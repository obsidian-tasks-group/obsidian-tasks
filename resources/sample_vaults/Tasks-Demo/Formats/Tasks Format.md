# Tasks Format

## Tasks Format for Dates

- [ ] #task Has a created date ➕ 2023-04-13
- [ ] #task Has a scheduled date ⏳ 2023-04-14
- [ ] #task Has a start date 🛫 2023-04-15
- [ ] #task Has a due date 📅 2023-04-16
- [x] #task Has a done date ✅ 2023-04-17

## Tasks Format for Priorities

<!-- placeholder to force blank line before included text --><!-- include: DocsSamplesForTaskFormats.test.Serializer_Priorities_tasksPluginEmoji-include.approved.md -->

- [ ] #task Lowest priority ⏬
- [ ] #task Low priority 🔽
- [ ] #task Normal priority
- [ ] #task Medium priority 🔼
- [ ] #task High priority ⏫
- [ ] #task Highest priority 🔺

<!-- placeholder to force blank line after included text --><!-- endInclude -->

## Tasks Format for Recurrence

- [ ] #task Is a recurring task 🔁 every day when done

---

## Confirming that the fields are read correctly

```tasks
path regex matches /^Formats\/Tasks Format/
group by heading
sort by description
```
