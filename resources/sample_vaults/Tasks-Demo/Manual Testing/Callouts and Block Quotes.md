# Callouts and Block Quotes

## 1 Query

### 1.1 Full Mode, with headings - in callout

> [!NOTE] Tasks recognised by Tasks Plugin in this file - full mode
>
> ```tasks
> path includes {{query.file.path}}
> group by heading
> sort by description
> ```

### 1.2 Short Mode, without headings - incallout

> [!NOTE] Tasks recognised by Tasks Plugin in this file - short mode
>
> ```tasks
> path includes {{query.file.path}}
> short mode
> sort by description
> ```

### 1.3 Short Mode, without headings -  not in callout

```tasks
path includes {{query.file.path}}
short mode
sort by description
```

---

## 2 Vanilla

- [ ] #task Task 1 Vanilla
  - Child list item of 'Task 1 Vanilla'
- [ ] #task Task 2 Vanilla

## 3 Callout

> [!NOTE]
>
> - [ ] #task Task 1 Callout
>   - Child list item of 'Task 1 Callout'
> - [ ] #task Task 2 Callout

### 3.1 Callout containing Blockquote

> [!NOTE]
> >
> > - [ ] #task Task 1 Callout containing Blockquote
> >   - Child list item of 'Task 1 Callout containing Blockquote'
> > - [ ] #task Task 2 Callout containing Blockquote
>

## 4 Blockquote

> - [ ] #task Task 1 Blockquote
>   - Child list item of 'Task 1 Blockquote'
> - [ ] #task Task 2 Blockquote

### 4.1 Blockquote containing Callout

> > [!NOTE]
> >
> > - [ ] #task Task 1 Blockquote containing Callout
> >   - Child list item of 'Task 1 Blockquote containing Callout'
> > - [ ] #task Task 2 Blockquote containing Callout

## 5 Numbered task in unordered list

The following tasks have extra properties on them so that, when in short mode, the tooltips have multiple lines, to demonstrate the issue

- [ ] #task 1. Task 1 Numbered task in unordered list 🔁 every day when done ➕ 2024-09-08 🛫 2024-09-08 ⏳ 2024-09-08 📅 2024-09-08
- [ ] #task 2. Task 2 Numbered task in unordered list 🔁 every day when done ➕ 2024-09-08 🛫 2024-09-08 ⏳ 2024-09-08 📅 2024-09-08

## 6 Not currently treated as a task by Tasks

x - [ ] #task  wibble

```text
- [ ] #task Task 1 Vanilla
```

### 6.1 Task in numbered list

1. [ ] #task Task 1 Task in numbered list
    1. Child list item of 'Task 1 Task in numbered list'
2. [ ] #task Task 2 Task in numbered list
