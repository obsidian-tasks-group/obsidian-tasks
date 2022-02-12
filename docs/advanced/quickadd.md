---
layout: default
title: Quickadd
nav_order: 5
parent: Advanced
has_toc: false
---

# Quickadd

The [quickadd](https://github.com/chhoumann/quickadd) plugin can help when creating tasks.
Additional to the official command to create a task, you can use a quickadd command with a custom capture format.

For example:

```
{% raw %}#task {{VALUE:task name}} ⏰ {{VDATE:reminder date and time,YYYY-MM-DD HH:mm}} {{VALUE:⏫,🔼,🔽, }} 🔁 {{VALUE:recurrence}} 🛫 {{VDATE:start date,YYYY-MM-DD}} ⏳ {{VDATE:scheduled date,YYYY-MM-DD}} 📅 {{VDATE:due date,YYYY-MM-DD}}{% endraw %}
```

You can remove/leave some fields to make different types of tasks. And each one can have its own command.

## Some Examples

Task with due date only:

`{% raw %}#task {{VALUE:task name}} 📅 {{VDATE:due date,YYYY-MM-DD}}{% endraw %}`

Task with priority and reminder date and due date:

`{% raw %}#task {{VALUE:task name}} ⏰ {{VDATE:reminder date and time,YYYY-MM-DD HH:mm}} {{VALUE:⏫,🔼,🔽, }} 📅 {{VDATE:due date,YYYY-MM-DD}}{% endraw %}`

Task with recurrence and scheduled date and start date:

`{% raw %}#task {{VALUE:task name}} 🔁 {{VALUE:recurrence}} 🛫 {{VDATE:start date,YYYY-MM-DD}} ⏳ {{VDATE:scheduled date,YYYY-MM-DD}}{% endraw %}`

## How to add quickadd command

1. Install [nldates](https://github.com/argenos/nldates-obsidian) and [quickadd](https://github.com/chhoumann/quickadd)
2. choose the `capture` choice, then make it visible on the command palette by clicking on the flash emoji
3. Enable the `save as task` option, then enable the `capture format` option and paste your custom format

## Tip for repeated dates (to reduce friction)

If you notice that you are adding the same date multiple times, say for example the due date and the reminder date are the same.
Then you can give them the same name, this way you'll write the date only once and Quickadd will instert it in multiple places.

Here is the format for the current example:

```
{% raw %}#task {{VALUE:task name}} ⏰ {{VDATE:same date,YYYY-MM-DD}} {{VDATE:time,HH:mm}} 📅 {{VDATE:same date,YYYY-MM-DD}}{% endraw %}
```
