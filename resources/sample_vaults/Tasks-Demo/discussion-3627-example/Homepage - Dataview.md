# Homepage - Dataview

## Dataview - group by project

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

## Dataview - group by project status

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
