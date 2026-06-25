---
tags:
  - sample-tag
---
# Find tasks in notes with particular tag

Suppose we wanted to find all tasks in notes that had a particular tag `#examples` in the frontmatter.

Since Tasks 7.7.0, this is now possible in Tasks queries.

## Show tasks from files with a specific tag in frontmatter - exact tag search

```tasks
filter by function task.file.property('tags').includes('#sample-tag')
```

Note that this is an exact tag search. It will not match `#sample-tag/some-sub-tag`.

> [!NOTE]
> The above search is a manual test for the example code in
> [#### Show tasks from files with a specific tag in frontmatter](https://publish.obsidian.md/tasks/Getting+Started/Obsidian+Properties#Show+tasks+from+files+with+a+specific+tag+in+frontmatter)

## Find nested tag values in frontmatter

### Exact tag match

[[yaml_all_property_types_populated]] has a tags property value `sample/tag/value`.

```tasks
filter by function task.file.property('tags').includes('#sample/tag/value')
```

### Match start of tag

```tasks
filter by function task.file.property('tags').some(tag => tag.includes('#sample/'))
```

### Match text anywhere in tag

```tasks
filter by function task.file.property('tags').some(tag => tag.includes('/tag/'))
```

## Sample task

- [ ] #task I am an a file with a tag property 'sample-tag'
