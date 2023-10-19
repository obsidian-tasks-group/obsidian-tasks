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


<!-- placeholder to force blank line after included text -->
