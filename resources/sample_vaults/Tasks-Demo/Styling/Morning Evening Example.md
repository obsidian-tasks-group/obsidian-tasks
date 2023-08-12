# Morning Evening Example

This note, and its associated CSS, shows how to create an appealing presentation to track tasks that need to be done each morning and evening.

> [!NOTE]
> The only reason that the task lines all have the `#task` tag is because this note happens to be in an existing vault that was set up with that tag as the global filter.

## Tasks

- [ ] #task Clothes in wash #when/morning 🔼 🔁 every week on Saturday when done 📅 2023-08-12
- [ ] #task Wash bedding #when/morning 🔼 🔁 every 14 days when done ⏳ 2023-08-12
- [ ] #task **Feed the cats** Saturday #when/morning 🔺 📅 2023-08-12
- [ ] #task Refill weekly medicines container #when/morning ⏫ 📅 2023-08-12
- [ ] #task Do back exercises #when/morning ⏫ 🔁 every day when done 📅 2023-08-12
- [ ] #task Do morning knee exercises #when/morning 🔺 🔁 every day when done 📅 2023-08-12
- [ ] #task Do arm exercises with weights #when/morning ⏫ 🔁 every day when done 📅 2023-08-12
- [ ] #task Exercises - walk one mile or exercise class #when/morning #when/evening 🔺 🔁 every day when done 📅 2023-08-11
- [ ] #task Check I have done today's puzzle #when/evening #context/ios 🔺 🔁 every day when done 📅 2023-08-11
- [ ] #task Do evening knee exercises #when/evening 🔺 🔁 every day when done 📅 2023-08-11
- [ ] #task Prepare cereals for tomorrow #when/evening ⏫ 🔁 every day when done ⏳ 2023-08-11
- [ ] #task Charge bathroom LED light #context/home #when/morning 🔁 every 2 weeks when done ⏳ 2023-08-12

## Search

```tasks
happens before tomorrow

(tag includes #when/morning) OR (tag includes #when/evening)
(status.type is TODO) OR (status.type is IN_PROGRESS)

sort by status.type
sort by priority
sort by description

group by function reverse task.tags.filter( (tag) => tag.includes("#when") ).sort().join(', ').replace(/#when\//g, '').replace('morning', '🔆 Morning').replace('evening', '🌅 Evening')

hide tags
hide priority
hide recurrence rule
short mode
```
