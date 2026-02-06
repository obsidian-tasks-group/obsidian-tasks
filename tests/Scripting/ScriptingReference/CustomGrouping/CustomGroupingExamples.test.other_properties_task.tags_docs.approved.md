<!-- placeholder to force blank line before included text -->


```javascript
group by function task.tags
```

- Like "group by tags" except that tasks with no tags have no heading instead of "(No tags)".

```javascript
group by function task.tags.join(", ")
```

- Tasks with multiple tags are listed once, with a heading that combines all the tags.
- Separating with commas means the tags are clickable in the headings.

```javascript
group by function task.tags.sort().join(", ")
```

- As above, but sorting the tags first ensures that the final headings are independent of order of tags in the tasks.

```javascript
group by function task.tags.filter( (tag) => tag.includes("#context/") )
```

- Only create headings for tags that contain "#context/".

```javascript
group by function task.tags.filter( (tag) => ! tag.includes("#tag") )
```

- Create headings for all tags that do not contain "#tag".

```javascript
group by function \
    if (task.tags.length > 0) return task.tags; \
    return task.findClosestParentTask()?.tags ?? [];
```

- Group tag-less child tasks by any tags on their parent task:
  - If the task has any tags on its own line, then group by those tags.
  - Otherwise, look for the first parent task, and group by its tags.
  - If there is no parent task, treat the tags as empty.


<!-- placeholder to force blank line after included text -->
