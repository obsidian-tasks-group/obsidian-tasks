---
publish: true
---

# Links

> [!released]
> Use of Links in searches was introduced in Tasks X.Y.Z.

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
- The following values are available:
- From `task`:
  - `task.outlinks`
    - Returns a list of links in the task's line.
    - It does not contain links in any nested tasks or list items.
  - `task.file.outlinksInProperties`
    - Returns all the links in the task file's [[Obsidian Properties]].
  - `task.file.outlinksInBody`
    - Returns all the links in the body of the note containing the task.
    - Naturally, this includes any links on the task line itself.
  - `task.file.outlinks`
    - Returns all the links in both [[Obsidian Properties]] and the body of the note containing the task.
    - This contains all the links in `task.file.outlinksInProperties` and `task.file.outlinksInBody`.
- From `query`:
  - `query.file.outlinksInProperties`
    - Returns all the links in the query file's [[Obsidian Properties]].
  - `query.file.outlinksInBody`
    - Returns all the links in the body of the note containing the query.
  - `query.file.outlinks`
    - Returns all the links in both [[Obsidian Properties]] and the body of the note containing the query.
    - This contains all the links in `task.file.outlinksInProperties` and `task.file.outlinksInBody`.

## Links Query Examples

## Limitations of Links Handling and Searches

- Currently, searching of links is only possible via [[About Scripting|custom searches]].
- Tasks does not yet treat [Embeds](https://help.obsidian.md/embeds) as links. This will be fixed soon.
- Tasks does not yet provide an `inlinks` concept, that is, links *to* a particular file.
- `Link.destinationPath` is calculated when the file containing the task is read.
  - This will either have been during Obsidian startup, or when the file was last modified during the current session.
  - For performance reasons, if files are moved to different folders during an Obsidian session, any tasks that link to the moved files are not updated.
  - The workaround is to run the built-in `Reload app without saving` command.
