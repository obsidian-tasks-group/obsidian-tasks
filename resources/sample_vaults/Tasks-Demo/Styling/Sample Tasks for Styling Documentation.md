---
TQ_extra_instructions: |-
  path includes Sample Tasks for Styling Documentation
  hide toolbar
  hide task counts
groupby: function "Sample column heading"
---

# Sample Tasks for Styling Documentation

## Tasks

- [ ] #task Test Task #chores 🔁 every day 📅 2023-04-01

### Tasks Expected Appearance

When `tasks-plugin-tags-links-recurrence-gray` snippet is enabled:

![Image](https://raw.githubusercontent.com/obsidian-tasks-group/obsidian-tasks/main/docs/images/tasks-plugin-tags-links-recurrence-gray-snippet.png)

### Tasks Search Results

~~~tasks
heading includes Tasks
#group by {{query.file.property("groupby")}}
~~~

~~~tasks
heading includes Tasks
view columns by {{query.file.property("groupby")}}
~~~

## Priority shown in checkbox

- [ ] #task Highest priority example task 🔺
- [ ] #task High priority example task ⏫
- [ ] #task Medium priority example task 🔼
- [ ] #task Normal priority example task
- [ ] #task Low priority example task 🔽
- [ ] #task Lowest priority example task ⏬

### Priority shown in checkbox Expected Appearance

When `tasks-plugin-priority-as-checkbox-color` is enabled:

![Image](https://raw.githubusercontent.com/obsidian-tasks-group/obsidian-tasks/main/docs/images/tasks-plugin-priority-as-checkbox-color-snippet.png)

### Priority shown in checkbox Search Results

~~~tasks
heading includes Priority shown in checkbox
#group by {{query.file.property("groupby")}}
~~~

~~~tasks
heading includes Priority shown in checkbox
view columns by {{query.file.property("groupby")}}
~~~

## Priority shown in background

- [ ] #task Highest priority example task 🔺
- [ ] #task High priority example task ⏫
- [ ] #task Medium priority example task 🔼
- [ ] #task Normal priority example task
- [ ] #task Low priority example task 🔽
- [ ] #task Lowest priority example task ⏬

### Priority shown in background Expected Appearance

When `tasks-plugin-priority-as-background-color` is enabled:

![Image](https://raw.githubusercontent.com/obsidian-tasks-group/obsidian-tasks/main/docs/images/tasks-plugin-priority-as-background-color-snippet.png)

### Priority shown in background Search Results

~~~tasks
heading includes Priority shown in background
#group by {{query.file.property("groupby")}}
hide backlink
~~~

~~~tasks
heading includes Priority shown in background
view columns by {{query.file.property("groupby")}}
hide backlink
~~~

## Custom Status Symbols

- [ ] #task Task with status Todo
- [/] #task Task with status In Progress
- [x] #task Task with status Done
- [-] #task Task with status Cancelled

### Custom Status Symbols Expected Appearance

When `tasks-plugin-style-status-symbols` and Prism theme are enabled:

![Image](https://raw.githubusercontent.com/obsidian-tasks-group/obsidian-tasks/main/docs/images/tasks-plugin-style-status-symbols-snippet.png)

(Note that the Prism theme no longer seems to show Cancelled tasks as greyed out.)

### Custom Status Symbols Search Results

~~~tasks
heading includes Custom Status Symbols
#group by {{query.file.property("groupby")}}
hide backlinks
~~~

~~~tasks
heading includes Custom Status Symbols
view columns by {{query.file.property("groupby")}}
hide backlinks
~~~

## Custom Status Types

- [ ] #task Task with status Todo
- [/] #task Task with status In Progress
- [x] #task Task with status Done
- [-] #task Task with status Cancelled

### Custom Status Types Expected Appearance

When `tasks-plugin-style-status-types` and Prism theme are enabled:

![Image](https://raw.githubusercontent.com/obsidian-tasks-group/obsidian-tasks/main/docs/images/tasks-plugin-style-status-types-snippet.png)

(Note that the Prism theme no longer seems to show Cancelled tasks as greyed out.)

### Custom Status Types Search Results

~~~tasks
heading includes Custom Status Types
#group by {{query.file.property("groupby")}}
hide backlink
~~~

~~~tasks
heading includes Custom Status Types
view columns by {{query.file.property("groupby")}}
hide backlink
~~~

## Due Dates

- [ ] #task Something I should have done yesterday 📅 2023-04-01
- [-] #task A task I meant to do yesterday then cancelled, with a `-` symbol 📅 2023-04-01
- [ ] #task A task I should do today 📅 2023-04-02
- [x] #task Something I did already today 📅 2023-04-02 ✅ 2023-04-02

### Due Dates Expected Appearance

When `tasks-plugin-color-due-today-and-overdue` snippet is enabled:

![Image](https://raw.githubusercontent.com/obsidian-tasks-group/obsidian-tasks/main/docs/images/tasks-plugin-color-due-today-and-overdue-snippet.png)

### Due Dates Search Results

~~~tasks
heading includes Due Dates
#group by {{query.file.property("groupby")}}
hide backlinks
~~~

~~~tasks
heading includes Due Dates
view columns by {{query.file.property("groupby")}}
hide backlinks
~~~

## Tags

- [ ] #task Something to do #task/atHome

Another tag example:

- [ ] #task Something else that is #task/strategic

### Tags Expected Appearance

When `tasks-plugin-highlight-specific-tag-green-glow-snippet` is enabled:

![Image](https://raw.githubusercontent.com/obsidian-tasks-group/obsidian-tasks/main/docs/images/tasks-plugin-highlight-specific-tag-green-glow-snippet.png)

When `tasks-plugin-highlight-specific-tag-round-red-description` is enabled:

![Image](https://raw.githubusercontent.com/obsidian-tasks-group/obsidian-tasks/main/docs/images/tasks-plugin-highlight-specific-tag-round-red-description-snippet.png)

### Tags Search Results

~~~tasks
heading includes Tags
#group by {{query.file.property("groupby")}}
hide backlinks
~~~

~~~tasks
heading includes Tags
view columns by {{query.file.property("groupby")}}
hide backlinks
~~~

## Circle Checkboxes

- [ ] #task Something to do
- [x] #task Something that is done ✅ 2023-04-01

### Circle Checkboxes Expected Appearance

When `tasks-plugin-circular-checkboxes` snippet is enabled:

![Image](https://raw.githubusercontent.com/obsidian-tasks-group/obsidian-tasks/main/docs/images/tasks-plugin-circular-checkboxes-snippet.png)

### Circle Checkboxes Search Results

~~~tasks
heading includes Circle Checkboxes
#group by {{query.file.property("groupby")}}
hide backlinks
~~~

~~~tasks
heading includes Circle Checkboxes
view columns by {{query.file.property("groupby")}}
hide backlinks
~~~

## Grid Layout

- [x] #task Something I already did 🔼 ➕ 2023-03-11 🛫 2023-03-19 ⏳ 2023-03-18 📅 2023-04-25 ✅ 2023-04-01
- [ ] #task Do something moderately important  🔼 🔁 every 2 weeks ➕ 2023-04-01  🛫 2023-04-09 ⏳ 2023-04-08 📅 2023-04-15
- [ ] #task Do something that has an indented bullet note
    - Here is a tip on how to do that

### Grid Layout Expected Appearance

In Reading view:

![Image](https://raw.githubusercontent.com/obsidian-tasks-group/obsidian-tasks/main/docs/images/tasks-plugin-grid-layout-snippet-reading.png)

In a Tasks query block:

![Image](https://raw.githubusercontent.com/obsidian-tasks-group/obsidian-tasks/main/docs/images/tasks-plugin-grid-layout-snippet-query.png)

### Grid Layout Search Results

~~~tasks
heading includes Grid Layout
#group by {{query.file.property("groupby")}}
~~~

~~~tasks
heading includes Grid Layout
view columns by {{query.file.property("groupby")}}
~~~

