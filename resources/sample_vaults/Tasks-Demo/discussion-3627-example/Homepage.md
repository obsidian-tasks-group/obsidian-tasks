# Homepage

## Tasks queries to visualise behaviour

### Use 'group by' to visualise behaviour - see raw text

```tasks
not done
preset this_folder

group by function '1 `' + JSON.stringify(task.file.property("project")) + '`'
group by function '2 `' + JSON.stringify(task.file.propertyAsLink("project")?.destinationPath) + '`'
group by function '3 `' + JSON.stringify(task.file.propertyAsLink("project")?.destinationFile.property("status")) + '`'
```

### Use 'group by' to visualise behaviour - see rendered values

```tasks
not done
preset this_folder

group by function task.file.propertyAsLink("project")?.markdown ?? ''
```

## What the user requested

I want to only filter tasks that:

- are in active project (property status), every project has file representing it,
- but there are also other notes related to that project via project property.

So in the example i provided, i only want Active task to be present.

## Tasks searches

### One instruction

```tasks
not done
preset this_folder

filter by function task.file.propertyAsLink("project")?.destinationFile?.property("status") === "active"
```

### Two instructions

Possibly slightly faster version?

```tasks
not done
preset this_folder

filter by function task.file.hasProperty("project")
filter by function task.file.propertyAsLink("project")?.destinationFile?.property("status") === "active"
```

## Dataview equivalent

### Dataview - group by project

If **either** note could have inline properties:

```dataview
task
WHERE startswith(file.folder, this.file.folder)
GROUP BY file.frontmatter.project
```

If **neither** note could have inline properties:

```dataview
task
WHERE startswith(file.folder, this.file.folder)
GROUP BY project
```

### Dataview - group by project status

If **either** note could have inline properties:

```dataview
task
WHERE startswith(file.folder, this.file.folder)
GROUP BY project.file.frontmatter.status
```

If **neither** note could have inline properties:

```dataview
task
WHERE startswith(file.folder, this.file.folder)
GROUP BY project.status
```
