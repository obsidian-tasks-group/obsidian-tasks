---
layout: default
title: Notifications
nav_order: 4
parent: Advanced
has_toc: false
---

# Notifications

Within Tasks, notifications can be made possible by utilizing [obsidian-reminder](https://github.com/uphy/obsidian-reminder).
This utilizes the standard Tasks date (as the due date) and can be extended with an additional reminder date by including a ⏰ and a date/time in the format `⏰ YYYY-MM-DD HH:MM`.
Further, a default reminder can be enabled based on the Tasks' 'Due Date'.
To enable this make sure obsidian-reminder has enabled the tasks plugin format as below:

![obsidian-reminder setting](https://github.com/obsidian-tasks-group/obsidian-tasks/raw/gh-pages/resources/screenshots/reminder.png)
_Note that this is a screenshot of the reminder plugin's settings and not Tasks._

## Where to add the reminder date

The order is important when writing the task. You have to put the reminder date between the task name and the other fields :

```markdown
- [ ] #task task name ⏰ YYYY-MM-DD HH:mm ⏫  🔁 every *** 🛫 YYYY-MM-DD ⏳ YYYY-MM-DD 📅 YYYY-MM-DD
```

## How to complete the reminder

The reminder date doesn't change when completing the task as of yet, the date will change only when you complete it from the reminder popup or from the notification.

![image](https://user-images.githubusercontent.com/38974541/143463881-e4af4b91-426f-48e8-938e-4a1053b06677.png)
![image](https://user-images.githubusercontent.com/38974541/143464983-542675ae-a467-41c0-aaca-1075c42f8328.png)
