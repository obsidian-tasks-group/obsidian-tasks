---
TQ_extra_instructions: |-
  path includes Sample Tasks for Styling Documentation
  hide toolbar
  hide task counts
groupby: filename
---

# Sample Tasks for Styling Documentation

## Tasks

### Tasks Search Results

~~~tasks
heading includes Tasks
group by {{query.file.property("groupby")}}
~~~

~~~tasks
heading includes Tasks
view columns by {{query.file.property("groupby")}}
~~~

- [ ] #task Test Task #chores 🔁 every day 📅 2023-04-01

## Priority

### Priority Search Results

~~~tasks
heading includes Priority
group by {{query.file.property("groupby")}}
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

### Custom Statuses Search Results

~~~tasks
heading includes Custom Statuses
group by {{query.file.property("groupby")}}
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

### Due Dates Search Results

~~~tasks
heading includes Due Dates
group by {{query.file.property("groupby")}}
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

### Tags Search Results

~~~tasks
heading includes Tags
group by {{query.file.property("groupby")}}
~~~

~~~tasks
heading includes Tags
view columns by {{query.file.property("groupby")}}
~~~

- [ ] #task Something to do #task/atHome

Another tag example:

- [ ] #task Something else that is #task/strategic

## Circle Checkboxes

### Circle Checkboxes Search Results

~~~tasks
heading includes Circle Checkboxes
group by {{query.file.property("groupby")}}
~~~

~~~tasks
heading includes Circle Checkboxes
view columns by {{query.file.property("groupby")}}
~~~

- [ ] #task Something to do
- [x] #task Something that is done ✅ 2023-04-01

## Grid Layout

### Grid Layout Search Results

~~~tasks
heading includes Grid Layout
group by {{query.file.property("groupby")}}
~~~

~~~tasks
heading includes Grid Layout
view columns by {{query.file.property("groupby")}}
~~~

- [x] #task Something I already did 🔼 ➕ 2023-03-11 🛫 2023-03-19 ⏳ 2023-03-18 📅 2023-04-25 ✅ 2023-04-01
- [ ] #task Do something moderately important  🔼 🔁 every 2 weeks ➕ 2023-04-01  🛫 2023-04-09 ⏳ 2023-04-08 📅 2023-04-15
- [ ] #task Do something that has an indented bullet note
  - Here is a tip on how to do that
