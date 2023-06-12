---
publish: true
---

# Sequential Tasks (Dependencies)

## Usage

Tasks can be sequential, which means they will not show up in a query until the previous sequential task is complete.
In order to specify a task as sequential, you simply add the sequential signifier "⬇️".

Sequential tasks can be useful to avoid cluttering up query results with tasks that you aren't able to complete yet.
For example, lets say you wished to write an article, and add the following tasks that need to be done

- [ ] Choose a topic
- [ ] Research the subject
- [ ] Create an outline
- [ ] Develop main points
- [ ] Craft a conclusion
- [ ] Proofread and edit
- [ ] Publish the article

It's not very helpful for you to see 'Publish the article', or 'Proofread and edit' when you haven't even chosen a topic yet.
But if you made each task a sequential task

- [ ] Choose a topic ⬇️
- [ ] Research the subject ⬇️
- [ ] Create an outline ⬇️
- [ ] Develop main points ⬇️
- [ ] Craft a conclusion ⬇️
- [ ] Proofread and edit ⬇️
- [ ] Publish the article ⬇️

Now, you will only see 'Choose a topic' in the query window.
Then once you mark that as complete, 'Research the subject' will appear, and so on.
This enables your query results to show you only tasks that you can work on right now.

## Behaviour

Obsidian Tasks collects all tasks that are marked with a ⬇️ in a file and treats them as a single sequential set.
This includes if sequential tasks are separated by other text or even other regular tasks.
For example in the file below, Obsidian Tasks still treats task 1 and task 2 as sequential.

- [ ] task 1 ⬇️️️

- [ ] Non-sequential task

This is a paragraph of text

- [ ] task 2 ⬇️️️

> [!warning]
> Existing use of the ⬇️ emoji in tasks prior to this update could result in tasks not showing in queries.
> Specifically, for files with more than one incomplete task containing ⬇️, only the first task will show in queries

### Subtasks

Sequential tasks does not treat subtasks any differently to any other task. For example,

- [ ] Task 1 ⬇️️️
  - [ ] Sub-task 1 ⬇️️️
    - [ ] Sub-sub-task 1 ⬇️️️
    - [ ] test
  - [ ] sub-task 2
  - [ ] sub-task 3 ⬇️️

Will be treated the same as below.
More specifically, the 4 tasks with a sequential symbol will be treated as a set and shown one after another as they are completed

- [ ] Task 1 ⬇️️️
- [ ] Sub-task 1 ⬇️️️
- [ ] Sub-sub-task 1 ⬇️️️
- [ ] test
- [ ] sub-task 2
- [ ] sub-task 3 ⬇️️
