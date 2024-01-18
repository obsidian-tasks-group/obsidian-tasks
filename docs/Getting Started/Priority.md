---
publish: true
---

# Priority

## Priorities and Order

Tasks can have a priority.
In order to specify the priority of a task, you can append one of the "priority signifiers", shown here in decreasing order of priority:

1. 🔺 for highest priority
2. ⏫ for high priority
3. 🔼 for medium priority
4. use no signifier to indicate no priority
5. 🔽 for low priority
6. ⏬️ for lowest priority

If a task has no priority at all, it is considered between low and medium priority.
This means that the priority of 🔽 low tasks is considered lower than the priority of tasks without any specific priority.
The idea is that you can easily filter out unimportant tasks without needing to assign a priority to all relevant tasks.

```markdown
- [ ] take out the trash 🔼
```

> [!released]
> Priorities 'lowest' and 'highest' were introduced in Tasks 3.9.0.

## Easy adding of Priorities

Instead of adding the emoji manually, you can:

- Use the `Tasks: Create or edit` command when creating or editing a task.
  You will be able to select the priority from the options in the [[Create or edit Task|‘Create or edit Task’ Modal]].
- Using [[Auto-Suggest|Intelligent Auto-Suggest]],
  start typing the first few characters of `high`, `medium` or `low`, and press `<return>` to accept the suggested signifier.

## Related Tasks Block Instructions

The following instructions use the priority signifiers in tasks.

- `priority is (above, below)? (lowest, low, none, medium, high, highest)`
  - [[Filters#Priority|Documentation]]
- `sort by priority`
  - [[Sorting#Priority|Documentation]]
- `group by priority`
  - [[Grouping#Priority|Documentation]]
- `hide priority`
  - [[Layout|Documentation]]
