---
publish: true
---

# Links

> [!released]
> Use of Links in searches was introduced in Tasks 7.21.0.

> [!Tip]
> This documentation was written a little more quickly than usual, because to the need to release a fix for a bug in iOS and iPadOS versions [18.6](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/3546) and [26 Public Beta 2](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/3560).
>
> We plan to refine this page, based on user feedback after its initial release.

## How does Tasks treat Links?

You might want to start with the [[#Links Query Examples|examples below]] for an idea of *what* Tasks can do with Links.

This section describes the *how*...

- Links can be used in Tasks searches with the following instructions:
  - `filter by function`
  - `sort by function`
  - `group by function`
- Links recognises these styles on links in your notes:
  - `[[filename|optional alias]]`
  - `[alias](filename.md)`
  - Headings and nested headings in the links are also supported.

The following values are available:

| Value                             | Return Type | Notes                                                                                                                                                 |
| --------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`task`**                        |             |                                                                                                                                                       |
| `task.outlinks`                   | `Link[]`    | Returns a list of links in the task's line.<br>It does not contain links in any nested tasks or list items.                                           |
| `task.file.outlinksInProperties`  | `Link[]`    | Returns all the links in the task file's [[Obsidian Properties]].                                                                                     |
| `task.file.outlinksInBody`        | `Link[]`    | Returns all the links in the body of the note containing the task.<br>Naturally, this includes any links on the task line itself.                     |
| `task.file.outlinks`              | `Link[]`    | Returns all the links anywhere in the task's file.<br>It contains all the links in `task.file.outlinksInProperties` and `task.file.outlinksInBody`.   |
| **`query`**                       |             |                                                                                                                                                       |
| `query.file.outlinksInProperties` | `Link[]`    | Returns all the links in the query file's [[Obsidian Properties]].                                                                                    |
| `query.file.outlinksInBody`       | `Link[]`    | Returns all the links in the body of the note containing the query.                                                                                   |
| `query.file.outlinks`             | `Link[]`    | Returns all the links anywhere in the query's file.<br>It contains all the links in `query.file.outlinksInProperties` and `query.file.outlinksInBody` |

The return values are all arrays of `Link` objects.

## Link class

> [!NOTE] Documentation coming soon
> Documentation coming soon. In the meantime, you can see the comments in [Link.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Task/Link.ts) on GitHub.

## Links Query Examples

> [!NOTE] Documentation coming soon
> In the meantime, you can see some examples in [Accessing Links](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/resources/sample_vaults/Tasks-Demo/How%20To/Access%20links.md) on GitHub.

## Limitations of Links Handling and Searches

- Currently, searching of links is only possible via [[About Scripting|custom searches]].
- Tasks does not yet treat [Embeds](https://help.obsidian.md/embeds) as links. This will be fixed soon.
- Tasks does not yet provide an `inlinks` concept, that is, links *to* a particular file.
- `Link.destinationPath` is calculated when the file containing the task is read.
  - This will either have been during Obsidian startup, or when the file was last modified during the current session.
  - For performance reasons, if files are moved to different folders during an Obsidian session, any tasks that link to the moved files are not updated.
  - The workaround is to run the built-in `Reload app without saving` command.
