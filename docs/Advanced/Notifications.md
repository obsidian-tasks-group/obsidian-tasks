---
publish: true
---

# Notifications

<span class="related-pages">#plugin/reminder</span>

Within Tasks, notifications can be made possible by utilizing [obsidian-reminder](https://github.com/uphy/obsidian-reminder).
This utilizes the standard Tasks date (as the due date) and can be extended with an additional reminder date by including a ⏰ and a date/time in the format `⏰ YYYY-MM-DD HH:MM`.
Further, a default reminder can be enabled based on the Tasks' 'Due Date'.
To enable this make sure obsidian-reminder has enabled the tasks plugin format as below:

![obsidian-reminder setting](../images/reminder.png)
_Note that this is a screenshot of the reminder plugin's settings and not Tasks._

## Where to add the reminder date

The order is important when writing the task. Tasks requires the reminder date after the task description and before any other Tasks fields. Reminders [requires no content between the reminder date and the due date](https://uphy.github.io/obsidian-reminder/guide/interop-tasks.html#distinguish-due-date-and-reminder-date).

```markdown
- [ ] #task task name ⏰ YYYY-MM-DD HH:mm 📅 YYYY-MM-DD ⏫ 🔁 every week 🛫 YYYY-MM-DD ⏳ YYYY-MM-DD
```

With Reminders' "Distinguish between reminder date and due date" setting enabled, a reminder date you insert (for example via Reminders' auto-complete popup) is automatically placed before the other Tasks fields for you, and using the Reminders "remind later"/"defer" action only ever rewrites the ⏰ date — it no longer overwrites the fields between ⏰ and 📅.

Reminders can also fall back to 📅 (due), then ⏳ (scheduled), then 🛫 (start) as the reminder date when no ⏰ is present, via its "Fall back to due, scheduled, or start date" setting — see [Reminders' docs](https://uphy.github.io/obsidian-reminder/guide/interop-tasks.html#fall-back-to-due-scheduled-or-start-date).

## How to complete the reminder

The reminder date doesn't change when completing the task, the date will change only when you complete it from the reminder popup or from the notification.

![image](../images/reminder-popup.png)
![image](https://user-images.githubusercontent.com/38974541/143464983-542675ae-a467-41c0-aaca-1075c42f8328.png)

---

> [!warning]
> Completing recurring tasks does not work correctly with Reminders as of August 2022.
See [this issue in Reminders to check the current status](https://github.com/uphy/obsidian-reminder/issues/93).

---
