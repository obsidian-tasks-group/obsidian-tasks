# Homepage

## Comparisons of syntax

| System                                                                                | Group by linked project's status                                                                                  |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Bases                                                                                 | `formulas`: `project status: project.asFile().properties.status`<br>`groupBy`: `property: formula.project status` |
| Dataview                                                                              | `group by project.status` or<br>`group by project.file.frontmatter.status`                                        |
| Tasks as of [#3640](https://github.com/obsidian-tasks-group/obsidian-tasks/pull/3640) | `group by function task.file.propertyAsLink("project")?.asFile()?.property("status") ?? ''`                       |

Possible nicer Tasks ideas:

- `task.file.properties.project.status`
- `properties.project.status`
- `project.status`
