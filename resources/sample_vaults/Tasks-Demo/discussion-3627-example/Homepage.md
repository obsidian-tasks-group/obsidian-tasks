```tasks
not done
preset this_folder

group by function '1 `' + JSON.stringify(task.file.property("project")) + '`'
group by function '2 `' + JSON.stringify(task.file.propertyAsLink("project")?.destinationPath) + '`'
group by function '3 `' + JSON.stringify(task.file.propertyAsLink("project")?.destinationFile.property("status")) + '`'
```

I want to only filter tasks that:

- are in active project (property status), every project has file representing it,
- but there are also other notes related to that project via project property.

So in the example i provided, i only want Active task to be present.

```tasks
not done
preset this_folder

filter by function task.file.propertyAsLink("project")?.destinationFile?.property("status") === "active"
```

Possibly slightly faster version?

```tasks
not done
preset this_folder

filter by function task.file.hasProperty("project")
filter by function task.file.propertyAsLink("project")?.destinationFile?.property("status") === "active"
```
