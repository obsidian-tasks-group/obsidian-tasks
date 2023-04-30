---
publish: false
---

# Notifications

<span class="related-pages">#plugin/reminder</span>

Within Tasks, reminder notifications can be set using the standard Tasks format `⏲️ YYYY-MM-DD` for daily notifications at a set or by specifying the hour `⏲️ YYYY-MM-DD h:mm a`. Multiple reminders can be set by separating secondary reminders with a comma: `⏲️ 2000-03-24, 2000-03-28 10:05 am, 2000-03-31`

## Limitnations

- It's not posible to set a reminder for midnight 12:00 am. This due to a limination with how tasks creates dates using momentjs which sets the defaults time to midnight when one isn't provided.
- System notifications don't work on Mobile because Obsidian doesn't provide an API

## How to complete the reminder

The reminder date doesn't change when completing the task, the date will change only when you complete it from the reminder popup or from the notification.

![image](https://user-images.githubusercontent.com/38974541/143463881-e4af4b91-426f-48e8-938e-4a1053b06677.png)
![image](https://user-images.githubusercontent.com/38974541/143464983-542675ae-a467-41c0-aaca-1075c42f8328.png)

## Acknowledgment

This feature was created using code from uphy's [obsidian-reminder](https://github.com/uphy/obsidian-reminder) plugin.
