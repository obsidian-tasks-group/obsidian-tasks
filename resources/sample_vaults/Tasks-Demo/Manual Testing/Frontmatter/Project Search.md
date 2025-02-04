---
project: Project Search
---

# Project Search

## Search 1

```tasks
filter by function task.file.hasProperty('project')
group by function task.file.property('project')
```

## Search 2

```tasks
filter by function task.file.hasProperty('project')
filter by function task.file.property('project') === query.file.property('project')
group by function task.file.property('project')
```

## Search 3

Suppose you have a project property in your query file, and you want to find all tasks that link to a note with the name of the property:

```tasks
explain
(description includes [[{{query.file.property('project')}}]]) OR \
(description includes [[{{query.file.property('project')}}|) OR \
(description includes [[{{query.file.property('project')}}#) OR \
(description includes [[#) AND (filename includes {{query.file.property('project')}})
```

## Tasks

- [ ] #task Task 1 [[Project Search]]
- [ ] #task Task 2 [[Project Search#Search 1]]
- [ ] #task Task 3 [[Project Search|alias]]
- [ ] #task Task 4 [[#Search 3]]
