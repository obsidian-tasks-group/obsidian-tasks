# Parent-Child relationships - Tasks

> [!NOTE]- About numbering of headings
> Numbers in headings need to be separate by `-` instead of `.`, as dataview replaces `.` in group headings with ``, making Dataview sort the headings differently to Tasks.

## 1 Not completed tasks

- [ ] #task lonely task

- [ ] #task parent task
  - [ ] #task child task 1
    - non task grand-child
  - [ ] #task child task 2
  - non task child 3

  - [ ] #task Lonely indented task

### 1-1 H3 heading

- non task parent
  - [ ] #task another lonely indented task

- [ ] #task task grand-parent
  - non task intermediate parent
    - [ ] #task child task under non task intermediate parent
      - non task sub child

## 2 Completed tasks

- [x] #task parent task ✅ 2024-04-13
  - [x] #task child task 1 ✅ 2024-04-13
    - non task grand-child
  - [x] #task child task 2 ✅ 2024-04-13
  - non task child 3

  - [x] #task Lonely indented task ✅ 2024-04-13

### 2-1 H3 heading

- non task parent
  - [ ] #task another lonely indented task

## 3 Partially completed tasks (child completed)

- [ ] #task parent task
  - [ ] #task child task 1
    - non task grand-child
  - [x] #task child task 2 ✅ 2024-04-13
  - non task child 3

  - [ ] #task Lonely indented task

### 3-1 H3 heading

- non task parent
  - [ ] #task another lonely indented task

## 4 Partially completed tasks (parent completed)

- [x] #task parent task ✅ 2024-04-13
  - [ ] #task child task 1
    - non task grand-child
  - [ ] #task child task 2
  - non task child 3

  - [ ] #task Lonely indented task

### 4-1 H3 heading

- non task parent
  - [ ] #task another lonely indented task
