---
layout: default
title: Due Dates
nav_order: 2
parent: Getting Started
has_toc: false
---

# Due Dates

Tasks can have due dates.
In order to specify the due date of a task, you must append the "due date signifier 📅" followed by the date it is due to the end of the task.
The date must be in the format `YYYY-MM-DD`, meaning `Year-Month-Day` with leading zeros.
For example: `📅 2021-04-09` means the task is due on the 9th of April, 2021.

```
- [ ] take out the trash 📅 2021-04-09
```

Instead of adding the emoji and the date manually, you can use the `Tasks: Create or edit` command when creating or editing a task.
When you use the command, you can also set a due date like "Monday", "tomorrow", or "next week" and Tasks will automatically save the date in the correct format.

**You can only put block links (`^link-name`) behind the due/done dates. Anything else will break the parsing of dates and recurrence rules.**

---

See [Advanced]({{ site.baseurl }}{% link getting-started/advanced.md %}#additional-dates) for more dates you can use.
