---
TQ_extra_instructions: |-
  path includes Sample Tasks for Styling Documentation
groupby: filename
---

# Sample Tasks for Styling Documentation

## Tasks

~~~tasks
heading includes Tasks
~~~

~~~tasks
heading includes Tasks
view columns by {{query.file.property("groupby")}}
~~~

- [ ] #task Test Task #chores 🔁 every day 📅 2023-04-01

## Priority

~~~tasks
heading includes Priority
~~~

~~~tasks
heading includes Priority
view columns by {{query.file.property("groupby")}}
~~~

- [ ] #task Lowest priority example task ⏬
- [ ] #task Low priority example task 🔽
- [ ] #task Normal priority example task
- [ ] #task Medium priority example task 🔼
- [ ] #task High priority example task ⏫
- [ ] #task Highest priority example task 🔺

## Custom Statuses

~~~tasks
heading includes Custom Statuses
~~~

~~~tasks
heading includes Custom Statuses
view columns by {{query.file.property("groupby")}}
~~~

- [ ] #task Task with status Todo
- [/] #task Task with status In Progress
- [x] #task Task with status Done
- [-] #task Task with status Cancelled

## Due Dates

~~~tasks
heading includes Due Dates
~~~

~~~tasks
heading includes Due Dates
view columns by {{query.file.property("groupby")}}
~~~

- [ ] #task Something I should have done yesterday 📅 2023-04-01
- [-] #task A task I meant to do yesterday then cancelled, with a `-` symbol 📅 2023-04-01
- [ ] #task A task I should do today 📅 2023-04-02
- [x] #task Something I did already today 📅 2023-04-02 ✅ 2023-04-02

## Tags

~~~tasks
heading includes Tags
~~~

~~~tasks
heading includes Tags
view columns by {{query.file.property("groupby")}}
~~~

- [ ] #task Something to do #task/atHome

Another tag example:

- [ ] #task Something else that is #task/strategic

## Circle Checkboxes

~~~tasks
heading includes Circle Checkboxes
~~~

~~~tasks
heading includes Circle Checkboxes
view columns by {{query.file.property("groupby")}}
~~~

- [ ] #task Something to do
- [x] #task Something that is done ✅ 2023-04-01

## Grid Layout

~~~tasks
heading includes Grid Layout
~~~

~~~tasks
heading includes Grid Layout
view columns by {{query.file.property("groupby")}}
~~~

- [x] #task Something I already did 🔼 ➕ 2023-03-11 🛫 2023-03-19 ⏳ 2023-03-18 📅 2023-04-25 ✅ 2023-04-01
- [ ] #task Do something moderately important  🔼 🔁 every 2 weeks ➕ 2023-04-01  🛫 2023-04-09 ⏳ 2023-04-08 📅 2023-04-15
- [ ] #task Do something that has an indented bullet note
  - Here is a tip on how to do that
