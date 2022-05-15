---
layout: default
title: Priority
nav_order: 2
parent: Getting Started
has_toc: false
---

# Priority

Tasks can have a priority.
In order to specify the priority of a task, you can append one of the "priority signifiers":

1. ⏫ for high priority
2. 🔼 for medium priority
3. 🔽 for low priority

If a task has no priority at all, it is considered between low and medium priority.
This means that the priority of 🔽 low tasks is considered lower than the priority of tasks without any specific priority.
The idea is that you can easily filter out unimportant tasks without needing to assign a priority to all relevant tasks.

```markdown
- [ ] take out the trash 🔼
```

Instead of adding the emoji manually, you can use the `Tasks: Create or edit` command when creating or editing a task.
You will be able to select the priority from a dropdown.
