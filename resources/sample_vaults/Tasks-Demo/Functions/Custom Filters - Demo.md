# Custom Filters - Demo

## Tasks

### Treat my undated tasks as due on 2023-07-09

- [ ] #task  I do not have a due date
- [ ] #task  I do have a different due date than the heading value 📅 2023-07-10

### Treat my undated tasks as due on 2023-07-10

- [ ] #task  I do not have a due date either
- [ ] #task  I too have a different due date than the heading value 📅 2023-07-09

### Treat all my tasks as with tag #context/home

- [ ] #task  I do not have a tag for context, but am in a heading that does have one

### Nothing interesting in this heading

- [ ] #task  I have a tag for context, but my heading does not  #context/home

## Sample Searches

### Look for tasks for 2023-07-10

```tasks
not done

filename includes Custom Filters - Demo

# Infer happens date from heading for specific date, if not on task
filter by function task.happens.moment?.isSame('2023-07-10', 'day') || ( !task.happens.moment && task.heading.includes('2023-07-10'))
```

### Look for tasks to be done at home

```tasks
not done

filename includes Custom Filters - Demo

# Infer tag from heading
filter by function task.heading.includes('#context/home') || task.tags.find( (tag) => tag === '#context/home' ) && true || false
```
