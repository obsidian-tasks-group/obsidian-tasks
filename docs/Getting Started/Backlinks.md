---
publish: true
alias:
- Backlink
---

# Backlinks

<span class="related-pages">#feature/backlinks</span>

## What are backlinks?

In Tasks search results, by default each task is displayed with its filename,
and the name of the previous heading, for example `(ACME > Steps to world domination)`.
This is called a **backlink**.

This screenshot shows what this might look like, with some sample data:

![Tasks with vanilla backlink styles](../images/backlinks-default-style.png)

If the filename and previous heading are identical, or if there is no previous heading, only the filename is shown.

## Using backlinks for navigation

You can click on a backlink to navigate directly to the task's source line.

> [!Tip]
> This honours the standard Obsidian keyboard modifiers used when clicking on internal links, to control how the note is opened (Navigate, New Tab, New Tab Group, New Window).
>
> See the table in the Tabs section of the [Obsidian 1.0.0 release notes](https://forum.obsidian.md/t/obsidian-release-v1-0-0/44873#tabs-1).

> [!released]
> Navigating directly to the task line was introduced in Tasks 3.4.0.

## Limitations

- When in Reading mode and clicking a backlink, and switching to Edit mode to edit the task line, the pane does not scroll to the same position it was in Reading Mode.
  - We are tracking this in [issue #1879](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1879).

## Support

We use the label `scope: backlinks` to track feedback on backlinks:

- [Open Backlink-related Issues](https://github.com/obsidian-tasks-group/obsidian-tasks/issues?q=is%3Aopen+is%3Aissue+label%3A%22scope%3A+backlinks%22)
- [Open Backlink-related Discussions](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions?discussions_q=is%3Aopen+label%3A%22scope%3A+backlinks%22+sort%3Atop)
