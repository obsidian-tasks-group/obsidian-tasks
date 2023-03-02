---
layout: default
title: Priority
nav_order: 3
parent: Getting Started
has_toc: false
---

# Priority

## Priorities and Order

Tasks can have a priority.
In order to specify the priority of a task, you can append one of the "priority signifiers", shown here in decreasing order of priority:

1. ⏫ for high priority
2. 🔼 for medium priority
3. use no signifier to indicate no priority
4. 🔽 for low priority

If a task has no priority at all, it is considered between low and medium priority.
This means that the priority of 🔽 low tasks is considered lower than the priority of tasks without any specific priority.
The idea is that you can easily filter out unimportant tasks without needing to assign a priority to all relevant tasks.

```markdown
- [ ] take out the trash 🔼
```

## Easy adding of Priorities

Instead of adding the emoji manually, you can:

- Use the `Tasks: Create or edit` command when creating or editing a task.
  You will be able to select the priority from the options in the [[getting-started/create-or-edit-task|‘Create or edit Task’ Modal]].
- Using [[getting-started/auto-suggest|Intelligent Auto-Suggest]],
  start typing the first few characters of `high`, `medium` or `low`, and press <return> to accept the suggested signifier.

## Related Tasks Block Instructions

The following instructions use the priority signifiers in tasks.

- `priority is (above, below)? (low, none, medium, high)`
  - [[queries/filters#priority|Documentation]]
- `sort by priority`
  - [[queries/sorting#basics|Documentation]]
- `group by priority`
  - [[queries/grouping#basics|Documentation]]
- `hide priority`
  - [[queries/layout|Documentation]]
