# Integration with Quickadd plugin

Additional to the official command to create a task, you can use a quickadd command with a custom capture format : `#task {{VALUE: task name}} ⏰ {{VDATE:reminder date and time,YYYY-MM-DD HH:mm}} {{VALUE:⏫,🔼,🔽, }} 🔁 {{VALUE:recurrence}} 🛫 {{VDATE:start date,YYYY-MM-DD}} ⏳ {{VDATE:scheduled date,YYYY-MM-DD}} 📅 {{VDATE:due date,YYYY-MM-DD}}`.

You can remove/leave some fields to make different types of tasks. And each one can have its own command. 

## Some Examples 
- Task with due date only `#task {{VALUE: task name}} 📅 {{VDATE:due date,YYYY-MM-DD}}` ;
- Task with priority and reminder and due date `#task {{VALUE: task name}} ⏰ {{VDATE:reminder date and time,YYYY-MM-DD HH:mm}} {{VALUE:⏫,🔼,🔽, }}  📅 {{VDATE:due date,YYYY-MM-DD}}` ;
- Task with recurrence and scheduled date and start date `#task {{VALUE: task name}} 🔁 {{VALUE:recurrence}} 🛫 {{VDATE:start date,YYYY-MM-DD}} ⏳ {{VDATE:scheduled date,YYYY-MM-DD}}`.


## How to add quickadd command
1. Install [nldates](https://github.com/argenos/nldates-obsidian) and [quickadd](https://github.com/chhoumann/quickadd) ;
2. choose the `capture` choice, then make it visible on the command palette by clicking on the flash emoji ;
3. Enable the `save as task` option, then enable the `capture format` option and paste your custom format ;
4. You're done.
